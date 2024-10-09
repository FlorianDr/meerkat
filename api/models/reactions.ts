import { and, eq, gt, sql } from "drizzle-orm";
import db from "../db.ts";
import { reactions } from "../schema.ts";

export async function createReaction(
  { eventId, userId }: { eventId: number; userId: number },
): Promise<Reaction> {
  const [newReaction] = await db.insert(reactions).values({
    eventId: eventId,
    userId: userId,
    createdAt: new Date(),
  }).returning().execute();

  return newReaction;
}

export async function getUserReactionCountAfterDate(
  userId: number,
  date: Date,
): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(reactions)
    .where(
      and(
        eq(reactions.userId, userId),
        gt(reactions.createdAt, date),
      ),
    )
    .execute();

  return Number(result[0].count);
}

export type Reaction = typeof reactions.$inferSelect;
