import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import conferences from "./routes/conferences.ts";
import events from "./routes/events.tsx";

const app = new Hono();

app.use(logger());
app.route("/api/v1/conferences", conferences);
app.route("/events", events);

export default app;
