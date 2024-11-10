import app from "./app.ts";

Deno.serve({
  hostname: "0.0.0.0",
}, app.fetch);
