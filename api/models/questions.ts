import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { questions, users, votes } from "../schema.ts";
import db from "../db.ts";

const votesSnippet = sql`COUNT(${votes.questionId})`.mapWith(Number).as(
  "votes",
);

const getQuestionsPreparedStatement = db
  .select({
    id: questions.id,
    uid: questions.uid,
    eventId: questions.eventId,
    question: questions.question,
    createdAt: questions.createdAt,
    answeredAt: questions.answeredAt,
    userId: questions.userId,
    user: users,
    votes: votesSnippet,
  })
  .from(questions)
  .leftJoin(votes, eq(questions.id, votes.questionId))
  .leftJoin(users, eq(questions.userId, users.id))
  .where(
    and(
      eq(questions.eventId, sql.placeholder("event_id")),
      eq(users.blocked, false),
      isNull(questions.deletedAt),
    ),
  )
  .groupBy(questions.id, users.id)
  .orderBy(
    sql`${questions.answeredAt} DESC NULLs FIRST`,
    desc(votesSnippet),
    asc(questions.createdAt),
  )
  .prepare("questions_with_votes_by_event_id");

const getQuestionsPreparedStatementByCreation = db
  .select({
    id: questions.id,
    uid: questions.uid,
    eventId: questions.eventId,
    question: questions.question,
    createdAt: questions.createdAt,
    answeredAt: questions.answeredAt,
    userId: questions.userId,
    user: users,
    votes: votesSnippet,
  })
  .from(questions)
  .leftJoin(votes, eq(questions.id, votes.questionId))
  .leftJoin(users, eq(questions.userId, users.id))
  .where(
    and(
      eq(questions.eventId, sql.placeholder("event_id")),
      eq(users.blocked, false),
      isNull(questions.deletedAt),
    ),
  )
  .groupBy(questions.id, users.id)
  .orderBy(desc(questions.createdAt))
  .prepare("questions_with_votes_by_event_id");

export type Sort = "popular" | "newest";
export const Sorts = ["popular", "newest"] as const;

export async function getQuestions(
  eventId: number,
  sort: Sort = "popular",
) {
  const params = { event_id: eventId };
  const results = sort === "popular"
    ? await getQuestionsPreparedStatement.execute(params)
    : await getQuestionsPreparedStatementByCreation.execute(params);

  return results;
}

export async function createQuestion(
  question: Omit<Question, "uid" | "createdAt" | "id" | "answeredAt">,
) {
  const result = await db.insert(questions).values({
    ...question,
    uid: uuidv7(),
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

export async function markAsAnswered(
  id: number,
) {
  const results = await db.update(questions).set({
    answeredAt: new Date(),
  }).where(
    eq(questions.id, id),
  ).returning().execute();

  return results.length === 1 ? results[0] : null;
}

export async function deleteQuestion(id: number) {
  const results = await db.update(questions).set({
    deletedAt: new Date(),
  }).where(eq(questions.id, id)).returning().execute();

  return results.length === 1 ? results[0] : null;
}

export type Question = typeof questions.$inferSelect;
export type QuestionWithVotes = Question & { votes: number };
