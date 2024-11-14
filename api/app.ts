import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import { serveStatic } from "@hono/hono/deno";
import conferences from "./routes/conferences.ts";
import users from "./routes/users.ts";
import events from "./routes/events.tsx";
import questions from "./routes/questions.ts";
import home from "./routes/home.tsx";
import { config } from "./models/config.ts";
import speaker from "./routes/speaker.ts";
import sync from "./routes/sync.ts";

const app = new Hono();

app.use(logger());

app.route("/", conferences);
app.route("/", users);
app.route("/", events);
app.route("/", questions);
app.route("/", home);
app.route("/", speaker);
app.route("/", sync);

app.get("/leaderboard", serveStatic({ path: "./ui/dist/index.html" }));
app.get("/speaker", serveStatic({ path: "./ui/dist/index.html" }));
app.get("/e/:uid/*", serveStatic({ path: "./ui/dist/index.html" }));
app.get("/login", serveStatic({ path: "./ui/dist/index.html" }));
app.get("/assets/*", serveStatic({ root: "./ui/dist/" }));

app.get("/index.css", serveStatic({ path: "./api/components/index.css" }));
app.get("/index.js", serveStatic({ path: "./api/components/index.js" }));
app.get("/api/v1/config", (c) => {
  return c.json(config);
});

export default app;
