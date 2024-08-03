import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = Deno.env.get("DATABASE_POOLER_URL") ??
  Deno.env.get("DATABASE_URL");

if (!connectionString) {
  throw new Error("DATABASE_POOLER_URL or DATABASE_URL must be set");
}

const client = postgres(connectionString);

const db = drizzle(client);

export default db;
