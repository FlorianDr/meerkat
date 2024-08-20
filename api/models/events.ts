import { eq, sql } from "drizzle-orm";
import db from "../db.ts";
import { events } from "../schema.ts";
import { typeid } from "typeid-js";

export async function createEvents(
  conferenceId: number,
  newEvents: Omit<Event, "id" | "uid" | "conferenceId" | "createAt">[],
): Promise<Event[]> {
  const results = await db.insert(events).values(
    newEvents.map((event) => ({
      ...event,
      conferenceId,
      uid: typeid().getSuffix(),
    })),
  ).returning().execute();
  return results;
}

export async function getEvents(conferenceId: number): Promise<Event[]> {
  const results = await db.select().from(events).where(
    eq(events.conferenceId, conferenceId),
  ).orderBy(events.start).execute();
  return results;
}

const eventByUID = db.select().from(events).where(
  eq(events.uid, sql.placeholder("uid")),
).limit(1).prepare("event_by_uid");

export async function getEventByUID(uid: string): Promise<Event | null> {
  const event = await eventByUID.execute({ uid });
  return event.length === 1 ? event[0] : null;
}

export type Event = typeof events.$inferSelect;
