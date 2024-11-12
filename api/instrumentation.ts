import * as Sentry from "@sentry/deno";
import env from "./env.ts";

if (env.sentryDSN) {
  Sentry.init({
    dsn: env.sentryDSN,
    environment: env.environment,
  });
}
