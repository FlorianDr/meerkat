import { and, eq, sql } from "drizzle-orm";
import { conferenceRole } from "../schema.ts";
import db from "../db.ts";

const conferenceRolesByIdStatement = db
  .select()
  .from(conferenceRole)
  .where(eq(conferenceRole.userId, sql.placeholder("user_id")))
  .prepare("conference_roles_by_user_id");

export function getConferenceRoles(
  userId: number,
): Promise<ConferenceRole[]> {
  return conferenceRolesByIdStatement.execute({ user_id: userId });
}

export function getConferenceRolesForConference(
  userId: number,
  conferenceId: number,
): Promise<ConferenceRole[]> {
  return db
    .select()
    .from(conferenceRole)
    .where(
      and(
        eq(conferenceRole.userId, userId),
        eq(conferenceRole.conferenceId, conferenceId),
      ),
    );
}

export type ConferenceRole = typeof conferenceRole.$inferSelect;
