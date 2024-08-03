import { Hono } from "@hono/hono";
import zod from "zod";
import { conferences } from "./schema.ts";
import db from "./db.ts";

const app = new Hono();

const adminToken = Deno.env.get("ADMIN_TOKEN");

if (!adminToken) {
  throw new Error("ADMIN_TOKEN is required");
}

app.get("/api/v1/conferences", async (c) => {
  const all = await db.select().from(conferences).execute();
  return c.json({ result: all });
});

const conferenceCreateSchema = zod.object({
  name: zod.string(),
});

app.post("/api/v1/conferences", async (c) => {
  if (c.req.header("Authorization") !== `Bearer ${adminToken}`) {
    c.status(401);
    return c.json({ error: "Unauthorized" });
  }
  const rawJson = await c.req.json();
  const parseResult = conferenceCreateSchema.safeParse(rawJson);

  if (!parseResult.success) {
    c.status(400);
    return c.json({ error: parseResult.error });
  }

  const response = await db.insert(conferences).values(parseResult.data)
    .returning().execute();
  return c.json({ result: response });
});

export default app;
