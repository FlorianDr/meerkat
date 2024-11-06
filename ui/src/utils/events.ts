import { Event } from "../types.ts";

export const pageTitle = (event: Event | undefined) =>
  `Meerkat - ${event?.title ?? "engaging conferences"}`;
