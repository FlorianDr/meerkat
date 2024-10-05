/** @jsxImportSource @hono/hono/jsx */
import { Hono } from "@hono/hono";
import { setCookie } from "@hono/hono/cookie";
import { HTTPException } from "@hono/hono/http-exception";
import { jwt, sign } from "@hono/hono/jwt";
import { validator } from "@hono/hono/validator";
import type { ZKEdDSAEventTicketPCD } from "@pcd/zk-eddsa-event-ticket-pcd";
import { fromString, getSuffix } from "typeid-js";
import Layout from "../components/Layout.tsx";
import QR from "../components/QR.tsx";
import TopQuestions from "../components/TopQuestions.tsx";
import env from "../env.ts";
import { getConferenceById } from "../models/conferences.ts";
import { countParticipants, getEventByUID } from "../models/events.ts";
import {
  createUserFromZuTicketId,
  getUserByUID,
  getUserByZuTicketId,
} from "../models/user.ts";
import { createQuestion, getQuestions } from "../models/questions.ts";
import { checkProof, getZupassAddPCDURL } from "../zupass.ts";
import {
  constructJWTPayload,
  JWT_EXPIRATION_TIME,
  SUB_TYPE_ID,
} from "../utils/jwt.ts";
import { upgradeWebSocket } from "@hono/hono/deno";
import { createMiddleware } from "@hono/hono/factory";
import { broadcast, join, leave } from "../realtime.ts";
import { createReaction } from "../models/reactions.ts";
import Document from "../components/Document.tsx";

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

app.get("/events/:uid", eventMiddleware, async (c) => {
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
  const url = new URL(`/events/${uid}/remote`, origin);

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
  const { id: _id, ...rest } = event;
  const apiQuestions = questions.map(
    ({ id: _id, eventId: _eventId, userId: _userId, user, ...rest }) => ({
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
    },
  });
});

app.get(
  "/api/v1/events/:uid/live",
  eventMiddleware,
  upgradeWebSocket((c) => {
    const event = c.get("event");
    const uid = event.uid;
    return {
      onMessage: (event) => {
        console.log("Received unexpected message from client", event.data);
      },
      onOpen: (_event, ws) => {
        join(uid, ws);
      },
      onClose: (_event, ws) => {
        leave(uid, ws);
      },
    };
  }),
);

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
    const origin = c.req.header("origin") ?? env.base;
    const redirect = new URL(`/events/${uid}/qa`, origin);

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    if (user.blocked) {
      throw new HTTPException(403, { message: `User is blocked` });
    }

    const question = await createQuestion({
      eventId: event.id,
      question: questionText,
      userId: user.id,
    });

    broadcast(uid, { op: "insert", type: "question", uid: question.uid });

    return c.redirect(redirect.toString());
  },
);

app.get("/api/v1/events/:uid/proof/:watermark", eventMiddleware, async (c) => {
  const watermark = c.req.param("watermark");

  if (!watermark) {
    throw new HTTPException(400, { message: `Watermark is required` });
  }

  const event = c.get("event");
  const uid = event.uid;

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

app.post(
  "/api/v1/events/:uid/react",
  jwt({ secret: env.secret, cookie: "jwt" }),
  eventMiddleware,
  async (c) => {
    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);
    const user = await getUserByUID(getSuffix(userUID));

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    const event = c.get("event");

    const reaction = await createReaction({
      eventId: event.id,
      userId: user.id,
    });

    broadcast(event.uid, {
      op: "insert",
      type: "reaction",
      createdAt: reaction.createdAt,
    });

    return c.json({
      data: { createdAt: reaction.createdAt },
    });
  },
);

export default app;
