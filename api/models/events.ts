import { eq, getTableColumns, sql } from "drizzle-orm";
import { union } from "drizzle-orm/pg-core";
import db from "../db.ts";
import { events, questions, votes } from "../schema.ts";
import { buildConflictUpdateColumns } from "./utils.ts";
import { DEFAULT_COVER } from "./event.ts";

export async function upsertEvents(
  conferenceId: number,
  newEvents: Omit<Event, "id" | "conferenceId" | "createAt">[],
) {
  const allColumns = getTableColumns(events);
  const updateColumns = Object.keys(allColumns).filter(
    (column) =>
      !["uid", "conferenceId", "createdAt", "id", "cover"].includes(
        column,
      ),
  );

  const results = await db.insert(events)
    .values(
      newEvents.map((event) => ({
        ...event,
        uid: event.uid.toUpperCase(),
        conferenceId,
      })),
    )
    .onConflictDoUpdate({
      target: events.uid,
      set: buildConflictUpdateColumns(events, updateColumns as any),
    })
    .returning()
    .execute();
  return results;
}

export async function getEvents(conferenceId: number) {
  const results = await db.select().from(events).where(
    eq(events.conferenceId, conferenceId),
  ).orderBy(events.start).execute();
  return results;
}

const eventByUID = db.select().from(events).where(
  eq(events.uid, sql.placeholder("uid")),
).limit(1).prepare("event_by_uid");

export async function getEventByUID(uid: string) {
  const results = await eventByUID.execute({ uid: uid.toUpperCase() });
  const event = results.length === 1 ? results[0] : null;
  return event ? { ...event, cover: event.cover ?? DEFAULT_COVER } : null;
}

const eventByID = db.select().from(events).where(
  eq(events.id, sql.placeholder("id")),
).limit(1).prepare("event_by_id");

export async function getEventById(id: number) {
  const results = await eventByID.execute({ id });
  const event = results.length === 1 ? results[0] : null;
  return event ? { ...event, cover: event.cover ?? DEFAULT_COVER } : null;
}

export async function countParticipants(eventId: number) {
  const results = await db.select({
    count: sql`COUNT(DISTINCT(participants.user_id))`.mapWith(
      Number,
    ),
  }).from(
    union(
      db.select({ user_id: questions.userId }).from(questions).where(
        eq(questions.eventId, eventId),
      ),
      db.select({ user_id: votes.userId }).from(votes).innerJoin(
        questions,
        eq(questions.id, votes.questionId),
      ).where(
        eq(questions.eventId, eventId),
      ),
    ).as("participants"),
  ).execute();
  return results[0].count;
}

export type Event = typeof events.$inferSelect & { speaker: string | null };
