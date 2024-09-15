import { and, eq, sql } from "drizzle-orm";
import { questions, votes } from "../schema.ts";
import db from "../db.ts";

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

const uniqueVotersByEventId = db
  .select({
    userId: sql<number>`DISTINCT ${votes.userId}`,
  })
  .from(votes)
  .innerJoin(questions, eq(votes.questionId, questions.id))
  .where(eq(questions.eventId, sql.placeholder("event_id")))
  .prepare("unique_voters_by_event_id");

export async function getUniqueVotersByEventId(
  eventId: number,
): Promise<number[]> {
  const results = await uniqueVotersByEventId.execute({
    event_id: eventId,
  });

  return results.map((result) => result.userId);
}

export type Vote = typeof votes.$inferSelect;
