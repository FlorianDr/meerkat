import { eq, sql } from "drizzle-orm";
import { typeid } from "typeid-js";
import { questions } from "../schema.ts";
import db from "../db.ts";

const questionByEventIdPreparedStatement = db.select().from(questions).where(
  eq(questions.eventId, sql.placeholder("event_id")),
).orderBy(questions.createdAt).prepare("question_by_event_id");

export async function getQuestionsByEventId(
  eventId: number,
): Promise<Question[]> {
  const results = await questionByEventIdPreparedStatement.execute({
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

export type Question = typeof questions.$inferSelect;
