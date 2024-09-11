import { desc, eq, sql } from "drizzle-orm";
import { typeid } from "typeid-js";
import { questions, votes } from "../schema.ts";
import db from "../db.ts";

const questionByEventIdPreparedStatement = db.select().from(questions).where(
  eq(questions.eventId, sql.placeholder("event_id")),
).orderBy(desc(questions.createdAt)).prepare("question_by_event_id");

export async function getQuestionsByEventId(
  eventId: number,
): Promise<Question[]> {
  const results = await questionByEventIdPreparedStatement.execute({
    event_id: eventId,
  });
  return results;
}

const votesSnippet = sql<
  number
>`COUNT(${votes.questionId})`.as("votes");
const questionsWithVotesByEventIdPreparedStatement = db
  .select({
    id: questions.id,
    uid: questions.uid,
    eventId: questions.eventId,
    question: questions.question,
    createdAt: questions.createdAt,
    userId: questions.userId,
    votes: votesSnippet,
  })
  .from(questions)
  .leftJoin(votes, eq(questions.id, votes.questionId))
  .where(eq(questions.eventId, sql.placeholder("event_id")))
  .groupBy(questions.id)
  .orderBy(desc(votesSnippet), desc(questions.createdAt))
  .prepare("questions_with_votes_by_event_id");

export async function getQuestionsWithVotesByEventId(
  eventId: number,
): Promise<(Question & { votes: number })[]> {
  const results = await questionsWithVotesByEventIdPreparedStatement.execute({
    event_id: eventId,
  });

  return results;
}

export async function createQuestion(
  question: Omit<Question, "uid" | "createdAt" | "id">,
): Promise<Question> {
  const result = await db.insert(questions).values({
    ...question,
    uid: typeid().getSuffix(),
  }).returning().execute();

  if (result.length !== 1) {
    throw new Error("Failed to create question");
  }

  return result[0];
}

const getQuestionByUIDPreparedStatement = db.select().from(questions).where(
  eq(questions.uid, sql.placeholder("uid")),
).prepare("get_question_by_uid");

export async function getQuestionByUID(uid: string) {
  const result = await getQuestionByUIDPreparedStatement.execute({ uid });

  return result.length === 1 ? result[0] : null;
}

export type Question = typeof questions.$inferSelect;
export type QuestionWithVotes = Question & { votes: number };
