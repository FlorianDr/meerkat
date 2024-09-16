import { and, eq, sql } from "drizzle-orm";
import { questions, users, votes } from "../schema.ts";
import db from "../db.ts";
import { Question } from "./questions.ts";
import { User } from "./user.ts";

export async function createVote(
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

export async function deleteVote(
  questionId: number,
  userId: number,
): Promise<void> {
  await db.delete(votes).where(
    and(
      eq(votes.questionId, questionId),
      eq(votes.userId, userId),
    ),
  ).execute();
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
  const [results]: Vote[] | undefined = await votesByEventIdAndUserId.execute(
    {
      question_id: questionId,
      user_id: userId,
    },
  );

  return results;
}

export async function getVotesByUserId(
  userId: number,
): Promise<(Vote & { question: Question; user: User })[]> {
  const results = await db.select().from(votes).where(
    eq(votes.userId, userId),
  ).leftJoin(questions, eq(votes.questionId, questions.id)).leftJoin(
    users,
    eq(votes.userId, users.id),
  ).execute();

  return results.map((result) => ({
    ...result.votes,
    question: result.questions as Question,
    user: result.users as User,
  }));
}

export type Vote = typeof votes.$inferSelect;
