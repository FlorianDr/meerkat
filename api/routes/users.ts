import { z } from "zod";
import { Hono } from "@hono/hono";
import { jwt, sign, verify } from "@hono/hono/jwt";
import env from "../env.ts";
import { fromString, getSuffix } from "typeid-js";
import {
  constructJWTPayload,
  JWT_EXPIRATION_TIME,
  SUB_TYPE_ID,
} from "../utils/jwt.ts";
import {
  createUser,
  getUserByProvider,
  getUserByUID,
  User,
} from "../models/user.ts";
import { HTTPException } from "@hono/hono/http-exception";
import { getVotesByUserId } from "../models/votes.ts";
import { zValidator } from "@hono/zod-validator";
import { getCookie, setCookie } from "@hono/hono/cookie";
import { getFeatures } from "../models/features.ts";
import { createUserFromAccount } from "../models/user.ts";
import { markUserAsBlocked } from "../models/user.ts";
import { getConferenceRoles } from "../models/roles.ts";

const app = new Hono();

app.get("/api/v1/users/me", async (c) => {
  const features = await getFeatures();
  const supportsAnonymousLogin = features.some(
    (f) => f.name === "anonymous-login" && f.active,
  );
  const jwt = getCookie(c, "jwt");

  let user: User;
  if (jwt) {
    const { sub } = await verify(jwt, env.secret);
    const userUID = fromString(sub as string, SUB_TYPE_ID);
    const maybeUser = await getUserByUID(getSuffix(userUID));

    if (!maybeUser) {
      throw new HTTPException(401, { message: `User not found` });
    }

    if (maybeUser.blocked) {
      throw new HTTPException(403, { message: `User is blocked` });
    }

    user = maybeUser;
  } else if (supportsAnonymousLogin) {
    // This is a temporary solution to allow users to login without a JWT
    user = await createUser();
    const origin = c.req.header("origin") ?? env.base;
    const payload = constructJWTPayload(user);
    const token = await sign(payload, env.secret);

    const baseUrl = new URL(origin);
    setCookie(c, "jwt", token, {
      path: "/",
      domain: baseUrl.hostname,
      secure: baseUrl.protocol === "https:",
      httpOnly: true,
      maxAge: JWT_EXPIRATION_TIME,
      sameSite: "strict",
    });
  } else {
    throw new HTTPException(401, { message: `User not found` });
  }

  const { id: _id, blocked: _blocked, name, ...rest } = user;

  return c.json({
    data: {
      ...rest,
      name: name ?? undefined,
    },
  });
});

app.get(
  "/api/v1/users/me/votes",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);
    const user = await getUserByUID(getSuffix(userUID));

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    const votes = await getVotesByUserId(user.id);
    const apiVotes = votes.map((vote) => {
      return {
        questionUid: vote.question.uid,
        userUid: user.uid,
        createdAt: vote.createdAt,
      };
    });

    return c.json({ data: apiVotes });
  },
);

app.get(
  "/api/v1/users/me/roles",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);
    const user = await getUserByUID(getSuffix(userUID));
    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    const conferenceRoles = await getConferenceRoles(user.id);
    const apiRoles = conferenceRoles.map(({ userId: _userId, ...rest }) =>
      rest
    );

    return c.json({
      data: apiRoles,
    });
  },
);

const usersLoginScheme = z.object({
  publicKey: z.string(),
});

app.post(
  "/api/v1/users/login",
  zValidator("json", usersLoginScheme),
  async (c) => {
    const { publicKey } = c.req.valid("json");

    let user = await getUserByProvider("zupass", publicKey);

    if (!user) {
      user = await createUserFromAccount({
        provider: "zupass",
        id: publicKey,
      });
    }

    const origin = c.req.header("origin") ?? env.base;
    const payload = constructJWTPayload(user);
    const token = await sign(payload, env.secret);

    const baseUrl = new URL(origin);
    setCookie(c, "jwt", token, {
      path: "/",
      domain: baseUrl.hostname,
      secure: baseUrl.protocol === "https:",
      httpOnly: true,
      maxAge: JWT_EXPIRATION_TIME,
      sameSite: "Lax",
    });

    return c.json({ data: { user } });
  },
);

app.post(
  "/api/v1/users/:uid/block",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const uid = c.req.param("uid");

    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);

    const user = await getUserByUID(getSuffix(userUID));
    const blockedUser = await getUserByUID(uid);

    if (!user) {
      throw new HTTPException(404, { message: `User ${userUID} not found` });
    }

    const roles = await getConferenceRoles(user.id);
    const isSomeOrganizer = roles.some((r) => r.role == "organizer");

    if (!isSomeOrganizer) {
      throw new HTTPException(403, { message: `User is not an organizer` });
    }

    if (!blockedUser) {
      throw new HTTPException(404, {
        message: `Blocked User ${uid} not found`,
      });
    }

    await markUserAsBlocked(blockedUser.id);

    return c.json({ data: {} });
  },
);

export default app;
