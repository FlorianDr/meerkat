import { Hono } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";
import { jwt } from "@hono/hono/jwt";
import { fromString, getSuffix } from "typeid-js";
import { MAX_VOTES_PER_EVENT } from "../constants.ts";
import env from "../env.ts";
import { getEventById } from "../models/events.ts";
import { getQuestionByUID, markAsAnswered } from "../models/questions.ts";
import { getConferenceRolesForConference } from "../models/roles.ts";
import { getUserByUID } from "../models/user.ts";
import {
  createVote,
  deleteVote,
  getUserVoteCountAfterDate,
  getVotesByQuestionIdAndUserId,
} from "../models/votes.ts";
import { broadcast } from "../realtime.ts";
import { dateDeductedMinutes } from "../utils/date-deducted-minutes.ts";
import { SUB_TYPE_ID } from "../utils/jwt.ts";

const app = new Hono();

app.post(
  "/api/v1/questions/:uid/upvote",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const uid = c.req.param("uid");

    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);

    const [user, question] = await Promise.all([
      getUserByUID(getSuffix(userUID)),
      getQuestionByUID(uid),
    ]);

    if (!user) {
      throw new HTTPException(401, { message: `User ${userUID} not found` });
    }

    if (user.blocked) {
      throw new HTTPException(403, { message: `User is blocked` });
    }

    if (!question) {
      throw new HTTPException(404, {
        message: `Question ${uid} not found`,
      });
    }

    const event = await getEventById(question.eventId);

    if (!event) {
      throw new HTTPException(404, {
        message: `Event ${question.eventId} not found`,
      });
    }

    const minuteAgo = dateDeductedMinutes(1);
    const voteCount = await getUserVoteCountAfterDate(
      user.id,
      event.id,
      minuteAgo,
    );

    if (voteCount >= MAX_VOTES_PER_EVENT) {
      throw new HTTPException(403, { message: "User has too many votes" });
    }

    const hasVoted = await getVotesByQuestionIdAndUserId({
      questionId: question.id,
      userId: user.id,
    });

    if (hasVoted) {
      await deleteVote(question.id, user.id);
    } else {
      await createVote(question.id, user.id);
    }

    broadcast(
      event.uid,
      { op: "update", type: "question", uid: question.uid },
    );

    const origin = c.req.header("origin") ?? env.base;
    const redirect = new URL(`/events/${event?.uid}/qa`, origin);
    return c.redirect(redirect.toString());
  },
);

app.post(
  "/api/v1/questions/:uid/mark-as-answered",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const uid = c.req.param("uid");

    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);

    const [user, question] = await Promise.all([
      getUserByUID(getSuffix(userUID)),
      getQuestionByUID(uid),
    ]);

    if (!user) {
      throw new HTTPException(401, { message: `User ${userUID} not found` });
    }

    if (!question) {
      throw new HTTPException(404, {
        message: `Question ${uid} not found`,
      });
    }

    const event = await getEventById(question.eventId);

    if (!event) {
      throw new HTTPException(404, {
        message: `Event ${question.eventId} not found`,
      });
    }

    const roles = await getConferenceRolesForConference(
      user.id,
      event.conferenceId,
    );
    const isOrganizer = roles.some((role) => role.role === "organizer");

    if (!isOrganizer) {
      throw new HTTPException(403, { message: `User is not an organizer` });
    }

    await markAsAnswered(question.id);

    broadcast(
      event.uid,
      { op: "update", type: "question", uid: question.uid },
    );

    const origin = c.req.header("origin") ?? env.base;
    const redirect = new URL(`/events/${event?.uid}/qa`, origin);
    return c.redirect(redirect.toString());
  },
);

export default app;
