import { and, eq, sql } from "drizzle-orm";
import { typeid } from "typeid-js";
import { accounts, users } from "../schema.ts";
import db from "../db.ts";
import { tickets } from "../schema.ts";
import { generateUsername } from "../usernames.ts";

export async function createUserFromZuTicketId(
  conferenceId: number,
  zuTicketId: string,
): Promise<User> {
  const result = await db.transaction(async (db) => {
    const result = await db.insert(users).values({
      uid: typeid().getSuffix(),
      name: generateUsername(),
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

export async function createUserFromAccount(
  { provider, id }: { provider: string; id: string },
) {
  const result = await db.transaction(async (db) => {
    const result = await db.insert(users).values({
      uid: typeid().getSuffix(),
      name: generateUsername(),
    }).returning().execute();

    if (result.length !== 1) {
      throw new Error("Failed to create user");
    }

    await db.insert(accounts).values({
      provider,
      id,
      userId: result[0].id,
    }).execute();

    return result[0];
  });

  return result;
}

export async function getUserByProvider(provider: string, id: string) {
  const result = await db.select().from(users).innerJoin(
    accounts,
    eq(
      users.id,
      accounts.userId,
    ),
  ).where(and(eq(accounts.provider, provider), eq(accounts.id, id))).execute();

  return result.length === 1 ? result[0].users : null;
}

export async function markUserAsBlocked(userId: number) {
  await db.update(users).set({ blocked: true }).where(
    eq(users.id, userId),
  ).execute();
}

export type User = typeof users.$inferSelect;
