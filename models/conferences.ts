import { eq, sql } from "drizzle-orm";
import { conferences } from "../schema.ts";

import db from "../db.ts";

const conferenceById = db.select().from(conferences).where(
  eq(conferences.id, sql.placeholder("id")),
).limit(1).prepare("conference_by_id");

export async function getConferenceById(id: number) {
  const conferences = await conferenceById.execute({ id });
  return conferences.length === 1 ? conferences[0] : null;
}

export function getConferences() {
  return db.select().from(conferences).execute();
}

export function createConference(
  newConference: typeof conferences.$inferInsert,
) {
  return db.insert(conferences).values(newConference)
    .returning().execute();
}

export type Conference = typeof conferences.$inferSelect;
