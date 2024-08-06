import { Hono } from "@hono/hono";
import { bearerAuth } from "@hono/hono/bearer-auth";
import zod from "zod";
import env from "../env.ts";
import {
  createConference,
  getConferenceById,
  getConferences,
} from "../models/conferences.ts";
import { createEvents, Event, getEvents } from "../models/events.ts";
import { getSuffix } from "typeid-js";

const app = new Hono();

app.get("/", async (c) => {
  const conferences = await getConferences();
  return c.json({ data: conferences });
});

const conferenceCreateSchema = zod.object({
  name: zod.string(),
});

app.post("/", bearerAuth({ token: env.adminToken }), async (c) => {
  const rawJson = await c.req.json();
  const parseResult = conferenceCreateSchema.safeParse(rawJson);

  if (!parseResult.success) {
    c.status(400);
    return c.json({ error: parseResult.error });
  }

  const conference = await createConference(parseResult.data);

  c.status(201);
  return c.json({ data: conference });
});

app.get("/:id/events", bearerAuth({ token: env.adminToken }), async (c) => {
  const conferenceId = parseInt(c.req.param("id"));
  const conference = await getConferenceById(conferenceId);

  if (!conference) {
    c.status(404);
    return c.json({ error: `Conference with id ${conferenceId} not found` });
  }

  const format = c.req.query("format");

  if (format && format !== "csv") {
    c.status(400);
    return c.json({ error: `Supported formats: csv` });
  }

  const events = await getEvents(conferenceId);

  if (format === "csv") {
    c.header("Content-Type", "text/csv");
    c.header(
      "Content-Disposition",
      `attachment; filename="${conference.name}.csv"`,
    );
    c.status(200);
    let responseText = `code,title,start,end,url\n`;

    const origin = c.req.header("Origin");
    events.forEach((event) => {
      responseText +=
        `${event.code},"${event.title}",${event.start.toISOString()},${event.end.toISOString()},${
          getEventUrl(event, origin)
        }\n`;
    });

    return c.text(responseText);
  }
  return c.json({ data: events });
});

const eventCreateSchema = zod.object({
  code: zod.string(),
  title: zod.string(),
  submissionType: zod.string(),
  start: zod.string().refine((v) => new Date(v).toString() !== "Invalid Date")
    .transform((v) => new Date(v)),
  end: zod.string().refine((v) => new Date(v).toString() !== "Invalid Date")
    .transform((v) => new Date(v)),
  abstract: zod.string().optional(),
  description: zod.string().optional(),
  track: zod.string().optional(),
  cover: zod.string().optional(),
});

const eventsCreateSchema = zod.array(eventCreateSchema);

const CREATION_LIMIT = 50;

app.post("/:id/events", bearerAuth({ token: env.adminToken }), async (c) => {
  const conferenceId = parseInt(c.req.param("id"));
  const conference = await getConferenceById(conferenceId);

  if (!conference) {
    c.status(404);
    return c.json({ error: `Conference with id ${conferenceId} not found` });
  }

  const rawJson = await c.req.json();
  const parseResult = eventsCreateSchema.safeParse(rawJson);

  if (!parseResult.success) {
    c.status(400);
    return c.json({ error: parseResult.error });
  }

  if (parseResult.data.length > CREATION_LIMIT) {
    c.status(400);
    return c.json({
      error: `Too many events, try ${CREATION_LIMIT} or less`,
    });
  }

  const response = await createEvents(conferenceId, parseResult.data);

  c.status(201);
  return c.json({ data: response });
});

function getEventUrl(event: Event, base = env.base) {
  return `${base}/events/${getSuffix(event.uid)}`;
}

export default app;
