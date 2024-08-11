import { type PipelineEdDSATicketZuAuthConfig } from "@pcd/passport-interface";
import { eq, sql } from "drizzle-orm";
import { conferences } from "../schema.ts";
import db from "../db.ts";

const conferenceById = db.select().from(conferences).where(
  eq(conferences.id, sql.placeholder("id")),
).limit(1).prepare("conference_by_id");

export async function getConferenceById(
  id: number,
): Promise<Conference | null> {
  const conferences = await conferenceById.execute({ id });
  return conferences.length === 1 ? toConference(conferences[0]) : null;
}

export async function getConferences(): Promise<Conference[]> {
  const result = await db.select().from(conferences).execute();
  return result.map(toConference);
}

export async function createConference(
  newConference: typeof conferences.$inferInsert,
): Promise<Conference> {
  const result = await db.insert(conferences).values(newConference)
    .returning().execute();

  if (result.length !== 1) {
    throw new Error("Failed to create conference");
  }

  return toConference(result[0]);
}

const toConference = (
  conference: typeof conferences.$inferSelect,
): Conference => {
  return {
    ...conference,
    zuAuthConfig: conference.zuAuthConfig as PipelineEdDSATicketZuAuthConfig[],
  };
};

export type Conference =
  & Omit<typeof conferences.$inferSelect, "zuAuthConfig">
  & {
    zuAuthConfig: PipelineEdDSATicketZuAuthConfig[];
  };
