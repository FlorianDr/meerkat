import { HTTPException } from "@hono/hono/http-exception";
import { Event } from "../models/events.ts";

const endBuffer = 1000 * 60 * 60 * 24; // 1 day

export const checkEventEnded = (event: Event) => {
  if (event.end && event.end < new Date(Date.now() + endBuffer)) {
    throw new HTTPException(403, {
      message: `Event ended on ${
        event.end.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      }`,
    });
  }
};
