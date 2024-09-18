import db from "../db.ts";
import { reactions } from "../schema.ts";

export async function createReaction(
  { eventId, userId }: { eventId: number; userId: number },
): Promise<Reaction> {
  const [newReaction] = await db.insert(reactions).values({
    eventId: eventId,
    userId: userId,
    createdAt: new Date(),
  }).execute();

  return newReaction;
}

export type Reaction = typeof reactions.$inferSelect;
