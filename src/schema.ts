import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const conferences = pgTable("conferences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  zuAuthConfig: jsonb("zu_auth_config"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  conferenceId: integer("conference_id").notNull().references(
    () => conferences.id,
    { onDelete: "cascade" },
  ),
  uid: text("uid").notNull().unique(),
  code: text("code").notNull().unique(),
  title: text("title").notNull(),
  submissionType: text("submission_type").notNull(),
  start: timestamp("start").notNull(),
  end: timestamp("end").notNull(),
  abstract: text("abstract"),
  description: text("description"),
  track: text("track"),
  cover: text("cover"),
}, (table) => {
  return {
    uidIdx: uniqueIndex("uid_idx").on(table.uid),
    codeIdx: uniqueIndex("code_idx").on(table.code),
  };
});
