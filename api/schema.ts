import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const conferences = pgTable("conferences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  zuAuthConfig: jsonb("zu_auth_config"),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  conferenceId: integer("conference_id")
    .notNull()
    .references(() => conferences.id, { onDelete: "cascade" }),
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
  speaker: text("speaker"),
});

export const questions = pgTable(
  "questions",
  {
    id: serial("id").primaryKey(),
    uid: text("uid").notNull().unique(),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    question: text("question").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    answeredAt: timestamp("answered_at"),
  },
  (table) => ({
    eventIdx: index("questions_event_id_idx").on(table.eventId),
  }),
);

export const votes = pgTable(
  "votes",
  {
    questionId: integer("question_id")
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.questionId, table.userId] }),
    userIdx: index("votes_user_id_idx").on(table.userId),
  }),
);

export const roleEnum = pgEnum("role", ["anonymous", "attendee", "organizer"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  name: text("name").unique(),
  blocked: boolean("blocked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conferenceRole = pgTable(
  "conference_role",
  {
    conferenceId: integer("conference_id")
      .notNull()
      .references(() => conferences.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.conferenceId, table.userId] }),
    userIdx: index("conference_role_user_id_idx").on(table.userId),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    id: text("id").notNull(),
  },
  (table) => ({
    providerId: unique("provider_id_uniq").on(table.provider, table.id),
  }),
);

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  zuTicketId: text("zu_ticket_id").notNull().unique(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  conferenceId: integer("conference_id")
    .notNull()
    .references(() => conferences.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const features = pgTable("features", {
  name: text("name").primaryKey(),
  active: boolean("active").notNull(),
});

export const reactions = pgTable(
  "reactions",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: integer("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    eventIdx: index("reactions_event_id_idx").on(table.eventId),
  }),
);
