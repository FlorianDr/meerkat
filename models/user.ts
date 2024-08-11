import { eq, sql } from "drizzle-orm";
import { typeid } from "typeid-js";
import { users } from "../schema.ts";
import db from "../db.ts";
import { tickets } from "../schema.ts";

export async function createUserFromZuTicketId(
  conferenceId: number,
  zuTicketId: string,
): Promise<User> {
  const result = await db.transaction(async (db) => {
    const result = await db.insert(users).values({
      uid: typeid().getSuffix(),
    }).returning().execute();

    if (result.length !== 1) {
      throw new Error("Failed to create user");
    }

    const user = result[0];

    await db.insert(tickets).values({
      conferenceId,
      userId: user.id,
      zuTicketId,
    }).execute();
    return user;
  });

  return result;
}

const getUserByZuTicketIdPreparedStatement = db.select({ user: users }).from(
  users,
).innerJoin(tickets, eq(users.id, tickets.userId)).where(
  eq(tickets.zuTicketId, sql.placeholder("zu_ticket_id")),
).limit(1).prepare("get_user_by_zu_ticket_id");

export async function getUserByZuTicketId(
  zuTicketId: string,
): Promise<User | null> {
  const result = await getUserByZuTicketIdPreparedStatement.execute({
    zu_ticket_id: zuTicketId,
  });

  return result.length === 1 ? result[0].user : null;
}

const getUserByUIDPreparedStatement = db.select().from(users).where(
  eq(users.uid, sql.placeholder("uid")),
).prepare("get_user_by_uid");

export async function getUserByUID(uid: string) {
  const result = await getUserByUIDPreparedStatement.execute({ uid });

  return result.length === 1 ? result[0] : null;
}

export type User = typeof users.$inferSelect;
