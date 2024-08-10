import { eq, sql } from "drizzle-orm";
import { fromString, TypeId } from "typeid-js";
import { questions } from "../schema.ts";
import db from "../db.ts";

const typePrefix = "question" as const;

const questionByEventId = db.select().from(questions).where(
  eq(questions.eventId, sql.placeholder("event_id")),
).orderBy(questions.createdAt).prepare("question_by_event_id");

export async function getQuestionsByEventId(
  eventId: number,
): Promise<Question[]> {
  const results = await questionByEventId.execute({ event_id: eventId });
  return results.map(toQuestion);
}

export type Question = Omit<typeof questions.$inferSelect, "uid"> & {
  uid: TypeId<typeof typePrefix>;
};

const toQuestion = (question: typeof questions.$inferSelect): Question => {
  return { ...question, uid: fromString(question.uid, typePrefix) };
};
