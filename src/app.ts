import { Hono } from "@hono/hono";
import conferences from "./routes/conferences.ts";

const app = new Hono();

app.route("/api/v1/conferences", conferences);

export default app;
