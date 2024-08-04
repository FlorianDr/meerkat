import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import env from "./env.ts";

const client = postgres(env.connectionString);

const db = drizzle(client);

export default db;
