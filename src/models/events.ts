import { eq, sql } from "drizzle-orm";
import db from "../db.ts";
import { events } from "../schema.ts";
import { fromString, TypeId, typeid } from "typeid-js";

const typePrefix = "event" as const;

export async function createEvents(
  conferenceId: number,
  newEvents: Omit<(typeof events.$inferInsert), "conferenceId" | "uid">[],
): Promise<Event[]> {
  const results = await db.insert(events).values(
    newEvents.map((event) => ({
      ...event,
      uid: typeid(typePrefix).toString(),
      conferenceId,
    })),
  ).returning().execute();
  return results.map(toEvent);
}

export async function getEvents(conferenceId: number): Promise<Event[]> {
  const results = await db.select().from(events).where(
    eq(events.conferenceId, conferenceId),
  ).orderBy(events.start).execute();
  return results.map(toEvent);
}

const eventByUID = db.select().from(events).where(
  eq(events.uid, sql.placeholder("uid")),
).limit(1).prepare("event_by_uid");

export async function getEventByUID(uid: string): Promise<Event | null> {
  const event = await eventByUID.execute({ uid });
  return event.length === 1 ? toEvent(event[0]) : null;
}

export type Event = Omit<typeof events.$inferSelect, "uid"> & {
  uid: TypeId<typeof typePrefix>;
};

const toEvent = (event: typeof events.$inferSelect): Event => {
  return { ...event, uid: fromString(event.uid, typePrefix) };
};
