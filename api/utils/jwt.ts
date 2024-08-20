import { typeid } from "typeid-js";
import { User } from "../models/user.ts";

export const SUB_TYPE_ID = "user" as const;

export const JWT_EXPIRATION_TIME = 60 * 60; // 1 hour

/**
 * Constructs a JWT payload for the given user.
 *
 * @param user - The user object for which to construct the JWT payload.
 * @returns The constructed JWT payload.
 *
 * @remarks
 * The constructed JWT payload includes the following properties:
 * - `sub`: A string representation of the user's unique identifier, prefixed with the `SUB_TYPE_ID`.
 * - `iat`: The current timestamp in seconds when the JWT was issued.
 * - `role`: The role of the user, which is set to "user".
 * - `exp`: The expiration timestamp in seconds, calculated by adding `JWT_EXPIRATION_TIME` to the current timestamp.
 */
export function constructJWTPayload(
  user: User,
) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return {
    sub: typeid(SUB_TYPE_ID, user.uid).toString(),
    iat: nowInSeconds,
    role: "user",
    exp: nowInSeconds + JWT_EXPIRATION_TIME,
  };
}
