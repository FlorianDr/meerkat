import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import { serveStatic } from "@hono/hono/deno";
import conferences from "./routes/conferences.ts";
import users from "./routes/users.ts";
import events from "./routes/events.tsx";

const app = new Hono();

app.use(logger());

app.route("/", conferences);
app.route("/", users);
app.route("/", events);

app.get("/events/:uid/qa", serveStatic({ path: "./ui/dist/index.html" }));
app.get("/assets/*", serveStatic({ root: "./ui/dist/" }));

app.get("/index.css", serveStatic({ path: "./api/components/index.css" }));

export default app;
