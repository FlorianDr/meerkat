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
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "@hono/hono/http-exception";
import { accepts } from "@hono/hono/accepts";

const app = new Hono();

app.get("/api/v1/conferences", async (c) => {
  const conferences = await getConferences();
  return c.json({ data: conferences });
});

const conferenceCreateSchema = zod.object({
  name: zod.string(),
});

export type ConferenceCreate = zod.infer<typeof conferenceCreateSchema>;

app.post(
  "/api/v1/conferences",
  bearerAuth({ token: env.adminToken }),
  zValidator("json", conferenceCreateSchema),
  async (c) => {
    const conferenceCreate = c.req.valid("json");
    const conference = await createConference(conferenceCreate);

    return c.json({ data: conference }, 201);
  },
);

const FORMATS = {
  csv: "text/csv",
  json: "application/json",
} as const;

app.get(
  "/api/v1/conferences/:id/events",
  bearerAuth({ token: env.adminToken }),
  async (c) => {
    const conferenceId = parseInt(c.req.param("id"));
    if (Number.isInteger(conferenceId) === false) {
      throw new HTTPException(400, {
        message: `Invalid conference id ${conferenceId}`,
      });
    }

    const conference = await getConferenceById(conferenceId);

    if (!conference) {
      throw new HTTPException(404, {
        message: `Conference with id ${conferenceId} not found`,
      });
    }

    const format = accepts(c, {
      header: "Accept",
      supports: [FORMATS.csv, FORMATS.json],
      default: FORMATS.csv,
    });

    const events = await getEvents(conferenceId);

    if (format === FORMATS.csv) {
      c.header("Content-Type", "text/csv");
      c.header(
        "Content-Disposition",
        `attachment; filename="${conference.name}.csv"`,
      );
      const origin = c.req.header("origin");
      const responseText = createCsvResponse(origin ?? env.base, events);
      return c.text(responseText);
    } else if (format === FORMATS.json) {
      return c.json({ data: events });
    } else {
      throw new HTTPException(406, {
        message: `Supported formats: ${Object.values(FORMATS).join(", ")}`,
      });
    }
  },
);

const eventCreateSchema = zod.object({
  uid: zod.string(),
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
  speaker: zod.string().optional(),
});

export type EventCreate = zod.infer<typeof eventCreateSchema>;

const eventsCreateSchema = zod.array(eventCreateSchema).max(50);

app.post(
  "/api/v1/conferences/:id/events",
  bearerAuth({ token: env.adminToken }),
  zValidator("json", eventsCreateSchema),
  async (c) => {
    const conferenceId = parseInt(c.req.param("id"));
    if (Number.isInteger(conferenceId) === false) {
      throw new HTTPException(400, {
        message: `Invalid conference id ${conferenceId}`,
      });
    }

    const conference = await getConferenceById(conferenceId);

    if (!conference) {
      throw new HTTPException(404, {
        message: `Conference with id ${conferenceId} not found`,
      });
    }

    const parsedJSON = c.req.valid("json");
    const events = parsedJSON.map((event) => {
      return {
        ...event,
        description: event.description ?? null,
        abstract: event.abstract ?? null,
        track: event.track ?? null,
        cover: event.cover ?? null,
        speaker: event.speaker ?? null,
      };
    });

    const response = await createEvents(conferenceId, events);

    return c.json({ data: response }, 201);
  },
);

function createCsvResponse(origin: string, events: Event[]) {
  let responseText = `code,title,start,end,url\n`;

  events.forEach((event) => {
    responseText +=
      `${event.uid},"${event.title}",${event.start.toISOString()},${event.end.toISOString()},${
        getEventUrl(event, origin)
      }\n`;
  });

  return responseText;
}

function getEventUrl(event: Event, base = env.base) {
  return `${base}/events/${event.uid}`;
}

export default app;
