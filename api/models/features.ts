import db from "../db.ts";
import { features } from "../schema.ts";

export function getFeatures() {
  return db.select().from(features).execute();
}
