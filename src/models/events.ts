import { eq, sql } from "drizzle-orm";
import db from "../db.ts";
import { events } from "../schema.ts";

const eventByUID = db.select().from(events).where(
  eq(events.uid, sql.placeholder("uid")),
).limit(1).prepare("event_by_uid");

export async function getEventByUID(uid: string) {
  const event = await eventByUID.execute({ uid });
  return event.length === 1 ? event[0] : null;
}
