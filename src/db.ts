import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import env from "./env.ts";

const client = postgres(env.connectionString, {
  // Disable prefetch as suggested by https://supabase.com/docs/guides/database/connecting-to-postgres#connecting-with-drizzle
  prepare: false,
  connect_timeout: 30,
});

const db = drizzle(client);

export default db;
