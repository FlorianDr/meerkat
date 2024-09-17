const adminToken = Deno.env.get("ADMIN_TOKEN");

if (!adminToken) {
  throw new Error("ADMIN_TOKEN is required");
}

const connectionString = Deno.env.get("DATABASE_POOLER_URL") ??
  Deno.env.get("DATABASE_URL");

if (!connectionString) {
  throw new Error("DATABASE_POOLER_URL or DATABASE_URL must be set");
}

const privateKey = Deno.env.get("PRIVATE_KEY");

if (!privateKey) {
  throw new Error("PRIVATE_KEY is required");
}

const secret = Deno.env.get("SECRET");

if (!secret) {
  throw new Error("SECRET is required");
}

const zupassUrl = Deno.env.get("ZUPASS_URL") ?? "https://zupass.org";
const base = Deno.env.get("BASE_URL") ?? "http://localhost:8000";

export default {
  adminToken,
  connectionString,
  base,
  secret,
  privateKey,
  zupassUrl,
};
