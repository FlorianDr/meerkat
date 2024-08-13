import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import conferences from "./routes/conferences.ts";
import events from "./routes/events.tsx";

const app = new Hono();

app.use(logger());
app.route("/", conferences);
app.route("/", events);

export default app;
