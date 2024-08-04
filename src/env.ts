const adminToken = Deno.env.get("ADMIN_TOKEN");

if (!adminToken) {
  throw new Error("ADMIN_TOKEN is required");
}

const connectionString = Deno.env.get("DATABASE_POOLER_URL") ??
  Deno.env.get("DATABASE_URL");

if (!connectionString) {
  throw new Error("DATABASE_POOLER_URL or DATABASE_URL must be set");
}

export default {
  adminToken,
  connectionString,
};
