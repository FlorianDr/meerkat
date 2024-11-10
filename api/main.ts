import app from "./app.ts";

Deno.serve(app.fetch, {
  hostname: "0.0.0.0",
});
