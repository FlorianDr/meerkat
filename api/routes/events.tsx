/** @jsxImportSource @hono/hono/jsx */
import { Hono } from "@hono/hono";
import { getCookie, setCookie } from "@hono/hono/cookie";
import { HTTPException } from "@hono/hono/http-exception";
import { decode, jwt, sign } from "@hono/hono/jwt";
import { validator } from "@hono/hono/validator";
import type { ZKEdDSAEventTicketPCD } from "@pcd/zk-eddsa-event-ticket-pcd";
import { fromString, getSuffix } from "typeid-js";
import Layout from "../components/Layout.tsx";
import QR from "../components/QR.tsx";
import TopQuestions from "../components/TopQuestions.tsx";
import env from "../env.ts";
import { getConferenceById } from "../models/conferences.ts";
import { getEventByUID } from "../models/events.ts";
import {
  createUserFromZuTicketId,
  getUserByUID,
  getUserByZuTicketId,
} from "../models/user.ts";
import {
  createQuestion,
  getQuestionByUID,
  getQuestionsWithVoteCountByEventId,
} from "../models/questions.ts";
import {
  addVote,
  getVoteCountByQuestionId,
  getVotesByQuestionIdAndUserId,
} from "../models/votes.ts";
import { checkProof, generateProofURL, getZupassAddPCDURL } from "../zupass.ts";
import { constructJWTPayload, JWT_EXPIRATION_TIME } from "../utils/jwt.ts";
import { randomBigInt } from "../utils/random-bigint.ts";
import { QuestionWithVotesAndHasVoted } from "../models/questions.ts";

const app = new Hono();

app.get("/events/:uid", async (c) => {
  const uid = c.req.param("uid");
  const event = await getEventByUID(uid);

  if (!event) {
    throw new HTTPException(404, { message: `Event ${uid} not found` });
  }

  const conference = await getConferenceById(event.conferenceId);

  if (!conference) {
    throw new HTTPException(404, {
      message: `Conference ${event.conferenceId} not found`,
    });
  }

  const origin = c.req.header("origin") ?? env.base;
  const url = new URL(`/events/${uid}/qa`, origin);

  const questions = await getQuestionsWithVoteCountByEventId(event.id);

  return c.html(
    <Layout>
      <div className="top-questions-container">
        <TopQuestions questions={questions} />
      </div>
      <div className="qr-container">
        <QR url={url} event={event} conferenceName={conference.name} />
      </div>
    </Layout>,
  );
});

app.get("/api/v1/events/:uid", async (c) => {
  const uid = c.req.param("uid");
  const event = await getEventByUID(uid);

  if (!event) {
    throw new HTTPException(404, { message: `Event ${uid} not found` });
  }

  const conference = await getConferenceById(event.conferenceId);

  if (!conference) {
    throw new HTTPException(404, {
      message: `Conference ${event.conferenceId} not found`,
    });
  }

  const questions = await getQuestionsWithVoteCountByEventId(event.id);

  const origin = c.req.header("origin") ?? env.base;

  const collectURL = await getZupassAddPCDURL({
    conference,
    event,
    origin,
  });

  const watermark = randomBigInt();
  const returnURL = new URL(`/api/v1/events/${uid}/proof/${watermark}`, origin);
  const proofURL = generateProofURL(
    watermark,
    returnURL.toString(),
    conference.zuAuthConfig,
  );

  // Strips out internal fields
  const { id: _id, conferenceId: _conferenceId, ...rest } = event;

  let publicQuestions: Omit<QuestionWithVotesAndHasVoted, "id" | "eventId">[];

  const jwtCookie = getCookie(c, "jwt");
  // if user is logged in, we check if user has voted on a particular question
  if (jwtCookie) {
    const decoded = decode(jwtCookie);
    const userUID = fromString(decoded.payload.sub as string, SUB_TYPE_ID);

    const user = await getUserByUID(getSuffix(userUID));

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    // checks if user has voted on a particular question
    publicQuestions = await Promise.all(
      questions.map(async (question) => {
        const userVote = await getVotesByQuestionIdAndUserId(
          {
            questionId: question.id,
            userId: user.id,
          },
        );

        const { id: _id, eventId: _eventId, ...rest } = question;

        return {
          ...rest,
          hasVoted: !!userVote,
        };
      }),
    );
  } else {
    // Strips out internal fields
    publicQuestions = questions.map(
      ({ id: _id, eventId: _eventId, ...rest }) => ({
        ...rest,
        hasVoted: false,
      }),
    );
  }

  return c.json({
    data: {
      ...rest,
      questions: publicQuestions,
      collectURL,
      proofURL,
    },
  });
});

const SUB_TYPE_ID = "user" as const;

app.post(
  "/api/v1/events/:uid/questions",
  jwt({ secret: env.secret, cookie: "jwt" }),
  validator("form", (value, c) => {
    const question = value["question"];
    if (!question || typeof question !== "string") {
      return c.text("Invalid question", 400);
    }
    return question;
  }),
  async (c) => {
    const questionText = c.req.valid("form");
    const uid = c.req.param("uid");

    const event = await getEventByUID(uid);

    if (!event) {
      throw new HTTPException(404, { message: `Event ${uid} not found` });
    }

    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);
    const user = await getUserByUID(getSuffix(userUID));
    const origin = c.req.header("origin") ?? env.base;
    const redirect = new URL(`/events/${uid}/qa`, origin);

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    await createQuestion({
      eventId: event.id,
      question: questionText,
      userId: user.id,
    });

    return c.redirect(redirect.toString());
  },
);

app.post(
  "/api/v1/questions/:questionUID/upvote",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const questionUID = c.req.param("questionUID");

    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);

    const [user, question] = await Promise.all([
      getUserByUID(getSuffix(userUID)),
      getQuestionByUID(questionUID),
    ]);

    if (!user) {
      throw new HTTPException(404, { message: `User ${userUID} not found` });
    }

    if (!question) {
      throw new HTTPException(404, {
        message: `Question ${questionUID} not found`,
      });
    }

    try {
      await addVote(question.id, user.id);
    } catch (error) {
      if (error.message.includes("duplicate key value")) {
        throw new HTTPException(400, {
          message: `User ${userUID} already voted for question ${questionUID}`,
        });
      }
      throw new Error(error);
    }

    const votes = await getVoteCountByQuestionId(question.id);

    return c.json({ votes });
  },
);

app.get("/api/v1/events/:uid/proof/:watermark", async (c) => {
  const watermark = c.req.param("watermark");

  if (!watermark) {
    throw new HTTPException(400, { message: `Watermark is required` });
  }

  const uid = c.req.param("uid");
  const event = await getEventByUID(uid);

  if (!event) {
    throw new HTTPException(404, { message: `Event ${uid} not found` });
  }

  const conference = await getConferenceById(event.conferenceId);

  if (!conference) {
    throw new HTTPException(404, {
      message: `Conference ${event.conferenceId} not found`,
    });
  }

  const proofString = c.req.query("proof");

  if (!proofString) {
    throw new HTTPException(400, { message: `Proof is required` });
  }

  const finished = c.req.query("finished");

  if (finished !== "true") {
    throw new HTTPException(400, { message: `Proof not finished` });
  }

  let ticketPCD: ZKEdDSAEventTicketPCD;
  try {
    ticketPCD = await checkProof(proofString, BigInt(watermark), conference);
  } catch (error) {
    console.error(`Failed to authenticate: ${error}`);
    throw new HTTPException(400, {
      message: `Failed to authenticate`,
      cause: error,
    });
  }

  const ticketId = ticketPCD.claim.partialTicket.ticketId;

  if (!ticketId) {
    throw new HTTPException(400, { message: `Ticket ID not found` });
  }

  let user = await getUserByZuTicketId(ticketId);

  if (!user) {
    user = await createUserFromZuTicketId(conference.id, ticketId);
  }

  const origin = c.req.header("origin") ?? env.base;
  const payload = constructJWTPayload(user);
  const token = await sign(payload, env.secret);

  const baseUrl = new URL(origin);
  setCookie(c, "jwt", token, {
    path: "/",
    domain: baseUrl.hostname,
    secure: baseUrl.protocol === "https:",
    httpOnly: true,
    maxAge: JWT_EXPIRATION_TIME,
    sameSite: "Lax",
  });

  const redirect = new URL(`/events/${uid}/qa`, origin);

  return c.redirect(redirect.toString());
});

export default app;
