import { Hono } from "@hono/hono";
import { bearerAuth } from "@hono/hono/bearer-auth";
import env from "../env.ts";
import { createConference, getConferences } from "../models/conferences.ts";
import { upsertEvents } from "../models/events.ts";
import { createSigner } from "../utils/secret.ts";
import { getEvent, getSessions, type Session } from "../devcon/api.ts";

const app = new Hono();

app.post(
  "/api/v1/sync/devcon/:eventId",
  bearerAuth({ token: env.syncToken }),
  async (c) => {
    const eventId = c.req.param("eventId");
    const event = await getEvent(eventId);
    const sessions = await getSessions(eventId);
    const conferences = await getConferences();

    let conference = conferences.find((c) => c.name === event.title);
    if (!conference) {
      conference = await createConference({ name: event.title });
    }

    const sign = await createSigner(env.codeSecret);
    const promises = sessions.map(async (session) => {
      const event = mapSessionToEvent(session);
      const secret = await sign(event.uid);
      return {
        ...event,
        secret,
        description: event.description ?? null,
        abstract: event.abstract ?? null,
        track: event.track ?? null,
        speaker: event.speaker ?? null,
      };
    });

    const events = await Promise.all(promises);

    await upsertEvents(conference.id, events);

    return c.json({ data: { success: true } }, 201);
  },
);

function mapSessionToEvent(session: Session) {
  return {
    uid: session.sourceId,
    title: session.title,
    submissionType: session.type,
    start: new Date(session.slot_start),
    end: new Date(session.slot_end),
    abstract: session.description,
    description: session.description,
    track: session.track,
    speaker: session.speakers.map(({ name }) => name).join(", ") ?? "Unknown",
  };
}

export default app;
