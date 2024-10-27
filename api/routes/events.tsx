/** @jsxImportSource @hono/hono/jsx */
import { Hono } from "@hono/hono";
import { createMiddleware } from "@hono/hono/factory";
import { HTTPException } from "@hono/hono/http-exception";
import { jwt } from "@hono/hono/jwt";
import { validator } from "@hono/hono/validator";
import { zValidator } from "@hono/zod-validator";
import { fromString, getSuffix } from "typeid-js";
import zod from "zod";
import Document from "../components/Document.tsx";
import Layout from "../components/Layout.tsx";
import QR from "../components/QR.tsx";
import TopQuestions from "../components/TopQuestions.tsx";
import {
  MAX_CHARS_PER_QUESTION,
  MAX_QUESTIONS_PER_EVENT,
  MAX_QUESTIONS_PER_INTERVAL,
  MAX_REACTIONS_PER_INTERVAL,
} from "../constants.ts";
import env from "../env.ts";
import { getConferenceById } from "../models/conferences.ts";
import { countParticipants, getEventByUID } from "../models/events.ts";
import { createQuestion, getQuestions } from "../models/questions.ts";
import {
  createReaction,
  getUserReactionCountAfterDate,
} from "../models/reactions.ts";
import {
  getUserByUID,
  getUserPostCountAfterDate,
  getUserPostCountPerTalk,
} from "../models/user.ts";
import { dateDeductedMinutes } from "../utils/date-deducted-minutes.ts";
import { SUB_TYPE_ID } from "../utils/jwt.ts";
import { getZupassAddPCDURL } from "../zupass.ts";
import { config } from "../models/config.ts";

const app = new Hono();

type Env = {
  Variables: {
    event: NonNullable<Awaited<ReturnType<typeof getEventByUID>>>;
  };
};

const eventMiddleware = createMiddleware<Env>(async (c, next) => {
  const uid = c.req.param("uid");
  if (!uid) {
    throw new HTTPException(400, { message: `Event UID is required` });
  }
  const event = await getEventByUID(uid);

  if (!event) {
    throw new HTTPException(404, { message: `Event ${uid} not found` });
  }

  c.set("event", event);
  await next();
});

app.get("/e/:uid", eventMiddleware, async (c) => {
  const event = c.get("event");
  const uid = event.uid;
  const [conference, questions, participants] = await Promise.all([
    getConferenceById(event.conferenceId),
    getQuestions(event.id),
    countParticipants(event.id),
  ]);

  if (!conference) {
    throw new HTTPException(404, {
      message: `Conference ${event.conferenceId} not found`,
    });
  }

  const origin = c.req.header("origin") ?? env.base;
  const url = new URL(`/e/${uid}/remote`, origin);

  return c.html(
    <Document>
      <Layout>
        <div className="top-questions-container">
          <TopQuestions questions={questions} participants={participants} />
        </div>
        <div className="qr-container">
          <QR url={url} event={event} conferenceName={conference.name} />
        </div>
      </Layout>
      <script src="/index.js" type="module"></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `globalThis.eventObject = '${
            JSON.stringify({ ...event, questions })
          }';globalThis.config = '${JSON.stringify(config)}';`,
        }}
      />
    </Document>,
  );
});

app.get("/api/v1/events/:uid", eventMiddleware, async (c) => {
  const event = c.get("event");
  const [conference, questions, participants] = await Promise.all([
    getConferenceById(event.conferenceId),
    getQuestions(event.id),
    countParticipants(event.id),
  ]);

  if (!conference) {
    throw new HTTPException(404, {
      message: `Conference ${event.conferenceId} not found`,
    });
  }

  const origin = c.req.header("origin") ?? env.base;

  const collectURL = await getZupassAddPCDURL({
    conference,
    event,
    origin,
  });

  // Strips out internal fields
  const { ...rest } = event;
  const apiQuestions = questions.map(
    ({ userId: _userId, user, ...rest }) => ({
      ...rest,
      user: user
        ? {
          uid: user?.uid,
          name: user?.name ?? undefined,
        }
        : undefined,
    }),
  );

  const votes = questions.reduce((acc, question) => acc + question.votes, 0);

  return c.json({
    data: {
      ...rest,
      questions: apiQuestions,
      collectURL,
      votes,
      participants,
      conference,
    },
  });
});

app.post(
  "/api/v1/events/:uid/questions",
  jwt({ secret: env.secret, cookie: "jwt" }),
  eventMiddleware,
  validator("form", (value, c) => {
    const question = value["question"];
    if (!question || typeof question !== "string") {
      return c.text("Invalid question", 400);
    }
    return question;
  }),
  async (c) => {
    const questionText = c.req.valid("form");
    const event = c.get("event");
    const uid = event.uid;

    if (!event) {
      throw new HTTPException(404, { message: `Event ${uid} not found` });
    }

    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);
    const user = await getUserByUID(getSuffix(userUID));

    if (!user) {
      throw new HTTPException(401, { message: "User not found" });
    }

    if (user.blocked) {
      throw new HTTPException(403, { message: "User is blocked" });
    }

    const minuteAgo = dateDeductedMinutes(1);
    const lastMinuteActivityPromise = getUserPostCountAfterDate(
      user.id,
      minuteAgo,
    );
    const talkActivityPromise = getUserPostCountPerTalk(user.id, event.id);
    const [lastMinuteActivity, talkActivity] = await Promise.all([
      lastMinuteActivityPromise,
      talkActivityPromise,
    ]);

    if (
      lastMinuteActivity >= MAX_QUESTIONS_PER_INTERVAL ||
      talkActivity >= MAX_QUESTIONS_PER_EVENT
    ) {
      throw new HTTPException(429, { message: "User has too many posts" });
    }

    if (questionText.length > MAX_CHARS_PER_QUESTION) {
      throw new HTTPException(400, { message: "Question is too long" });
    }

    const question = await createQuestion({
      eventId: event.id,
      question: questionText,
      userId: user.id,
    });

    return c.json({
      data: {
        createdAt: question.createdAt,
      },
    });
  },
);

const reactionScheme = zod.object({
  uid: zod.string(),
});

app.post(
  "/api/v1/events/:uid/react",
  zValidator("json", reactionScheme),
  jwt({ secret: env.secret, cookie: "jwt" }),
  eventMiddleware,
  async (c) => {
    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);
    const uid = c.req.valid("json").uid;
    const user = await getUserByUID(getSuffix(userUID));

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    const event = c.get("event");

    const thirtySecondsAgo = dateDeductedMinutes(0.5);
    const thirtySecondsActivity = await getUserReactionCountAfterDate(
      user.id,
      thirtySecondsAgo,
    );

    if (thirtySecondsActivity > MAX_REACTIONS_PER_INTERVAL) {
      throw new HTTPException(429, { message: `User has too many reactions` });
    }

    const reaction = await createReaction({
      uid,
      eventId: event.id,
      userId: user.id,
    });

    return c.json({
      data: {
        uid,
        createdAt: reaction.createdAt,
      },
    });
  },
);

export default app;
