import { and, eq, sql } from "drizzle-orm";
import { votes } from "../schema.ts";
import db from "../db.ts";

export async function addVote(
  questionId: number,
  userId: number,
): Promise<Vote> {
  const [newVote] = await db.insert(votes).values({
    questionId: questionId,
    userId: userId,
    createdAt: new Date(),
  }).execute();

  return newVote;
}

const voteCountByQuestionId = db.select({
  count: sql`COUNT(*)`,
}).from(votes).where(
  eq(votes.questionId, sql.placeholder("question_id")),
).prepare("vote_count_by_question_id");

export async function getVoteCountByQuestionId(
  questionId: number,
): Promise<number> {
  const results = await voteCountByQuestionId.execute({
    question_id: questionId,
  });

  return Number(results[0].count);
}

const votesByEventIdAndUserId = db
  .select()
  .from(votes)
  .where(
    and(
      eq(votes.questionId, sql.placeholder("question_id")),
      eq(votes.userId, sql.placeholder("user_id")),
    ),
  )
  .prepare("votes_by_event_id_and_user_id");

export async function getVotesByQuestionIdAndUserId(
  { questionId, userId }: { questionId: number; userId: number },
) {
  const [results] = await votesByEventIdAndUserId.execute({
    question_id: questionId,
    user_id: userId,
  });

  return results;
}

export type Vote = typeof votes.$inferSelect;
