import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import conferences from "./routes/conferences.ts";
import events from "./routes/events.tsx";
import { serveStatic } from "@hono/hono/deno";

const app = new Hono();

app.use(logger());
app.use("*", serveStatic({ root: "./ui/dist" }));
app.route("/", conferences);
app.route("/", events);

export default app;
