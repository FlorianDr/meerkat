import { type Context } from "@hono/hono";
import { setCookie } from "@hono/hono/cookie";
import env from "../env.ts";
import { JWT_EXPIRATION_TIME } from "./jwt.ts";

export function setJWTCookie(c: Context, token: string) {
  const origin = c.req.header("origin") ?? env.base;
  const baseUrl = new URL(origin);
  setCookie(c, "jwt", token, {
    path: "/",
    domain: baseUrl.hostname,
    secure: baseUrl.protocol === "https:",
    httpOnly: true,
    maxAge: JWT_EXPIRATION_TIME,
    sameSite: "Strict",
  });
}
