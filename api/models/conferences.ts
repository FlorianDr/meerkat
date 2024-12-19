import { and, eq, isNull, or, sql } from "drizzle-orm";
import { conferences, conferenceTickets } from "../schema.ts";
import db from "../db.ts";

const conferenceById = db.select().from(conferences).where(
  eq(conferences.id, sql.placeholder("id")),
).limit(1).prepare("conference_by_id");

export async function getConferenceById(
  id: number,
): Promise<Conference | null> {
  const conferences = await conferenceById.execute({ id });
  return conferences.length === 1 ? conferences[0] : null;
}

export async function getConferences(): Promise<Conference[]> {
  const result = await db.select().from(conferences).execute();
  return result;
}

export async function createConference(
  newConference: typeof conferences.$inferInsert,
): Promise<Conference> {
  const result = await db.insert(conferences).values(newConference)
    .returning().execute();

  if (result.length !== 1) {
    throw new Error("Failed to create conference");
  }

  return result[0];
}

export async function getConferenceByTicket(
  eventId: string,
  signerPublicKey: string,
  productId: string,
) {
  const result = await db.select().from(conferences).innerJoin(
    conferenceTickets,
    eq(conferences.id, conferenceTickets.conferenceId),
  ).where(
    and(
      eq(conferenceTickets.eventId, eventId),
      eq(conferenceTickets.signerPublicKey, signerPublicKey),
      or(
        isNull(conferenceTickets.productId),
        eq(conferenceTickets.productId, productId),
      ),
    ),
  ).limit(1).orderBy(conferenceTickets.productId).execute();

  return result.length === 1 ? result[0] : null;
}

export async function getTickets(conferenceId: number) {
  const result = await db.select().from(conferenceTickets).where(
    eq(conferenceTickets.conferenceId, conferenceId),
  ).execute();
  return result;
}

export type Conference = typeof conferences.$inferSelect;
