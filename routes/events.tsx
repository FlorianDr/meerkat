/** @jsxImportSource @hono/hono/jsx */
import { Hono } from "@hono/hono";
import { getCookie, setCookie } from "@hono/hono/cookie";
import { HTTPException } from "@hono/hono/http-exception";
import { jwt, sign, verify } from "@hono/hono/jwt";
import { validator } from "@hono/hono/validator";
import type { ZKEdDSAEventTicketPCD } from "@pcd/zk-eddsa-event-ticket-pcd";
import { authenticate } from "@pcd/zuauth/server";
import { fromString, getSuffix } from "typeid-js";
import Layout from "../components/Layout.tsx";
import QR from "../components/QR.tsx";
import env from "../env.ts";
import { getConferenceById } from "../models/conferences.ts";
import { getEventByUID } from "../models/events.ts";
import {
  createUserFromZuTicketId,
  getUserByUID,
  getUserByZuTicketId,
} from "../models/user.ts";
import { createQuestion, getQuestionsByEventId } from "../models/questions.ts";
import { generateProofURL, getZupassAddPCDURL } from "../zupass.ts";
import { constructJWTPayload, JWT_EXPIRATION_TIME } from "../utils/jwt.ts";

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

  return c.html(
    <Layout>
      <h1>{event.title}</h1>
      <div style={{ height: 300, width: 300 }}>
        <QR url={url} />
      </div>
      <span>Scan above QR code to join the discussion</span>
    </Layout>,
  );
});

app.get("/events/:uid/qa", async (c) => {
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

  const cookieValue = getCookie(c, "jwt");
  let userId: string | null = null;
  if (cookieValue) {
    const payload = await verify(cookieValue, env.secret);
    userId = payload.sub as string;
  }

  const questions = await getQuestionsByEventId(event.id);

  const origin = c.req.header("origin") ?? env.base;

  const url = await getZupassAddPCDURL({
    conference,
    event,
    origin,
  });

  const proofURL = generateProofURL(uid, origin, conference.zuAuthConfig);

  return c.html(
    <Layout>
      <h1>{event.title}</h1>
      <div style={{ height: 300, width: 300 }}>
        {questions.map(({ question }) => <div>{question}</div>)}
      </div>
      <a href={url.toString()} target="_blank">Collect event card</a>
      <a href={proofURL}>Prove attendance</a>
      {userId ? <p>Logged in as {userId}</p> : null}
      <form method="POST" action={`/events/${uid}/questions`}>
        <input type="text" name="question" />
        <button type="submit">Submit</button>
      </form>
    </Layout>,
  );
});

const SUB_TYPE_ID = "user" as const;

app.post(
  "/events/:uid/questions",
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

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    await createQuestion({
      eventId: event.id,
      question: questionText,
      userId: user.id,
    });

    console.info(`User ${user.id} asked question: ${questionText}`);

    return c.redirect(`/events/${uid}/qa`);
  },
);

app.get("/events/:uid/proof/:watermark", async (c) => {
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
    ticketPCD = await authenticate(proofString, {
      watermark,
      // For now, we have to use the watermark as the external nullifier
      externalNullifier: watermark,
      config: conference.zuAuthConfig,
      fieldsToReveal: {
        revealTicketId: true,
        revealEventId: true,
      },
    });
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
    user = await createUserFromZuTicketId(
      conference.id,
      ticketId,
    );
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

  return c.redirect(`${origin}/events/${uid}/qa`);
});

export default app;
