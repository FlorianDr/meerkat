import { z } from "zod";
import { Hono } from "@hono/hono";
import { jwt, sign } from "@hono/hono/jwt";
import env from "../env.ts";
import { constructJWTPayload, JWT_EXPIRATION_TIME } from "../utils/jwt.ts";
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
import { createUserFromAccount } from "../models/user.ts";
import { markUserAsBlocked } from "../models/user.ts";
import { getConferenceRoles } from "../models/roles.ts";
import {
  boundConfigFromJSON,
  gpcVerify,
  revealedClaimsFromJSON,
} from "@pcd/gpc";
import { fromFileUrl } from "@std/path/from-file-url";
import { join } from "@std/path/join";
import { dirname } from "@std/path/dirname";

const app = new Hono();

app.get(
  "/api/v1/users/me",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const payload = c.get("jwtPayload");
    const user = await getUserByUID(payload.sub);

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    if (user.blocked) {
      throw new HTTPException(403, { message: `User is blocked` });
    }

    const { id: _id, blocked: _blocked, ...rest } = user;

    return c.json({
      data: rest,
    });
  },
);

app.post("/api/v1/users", async (c) => {
  const deviceId = getCookie(c, "deviceId");

  if (!deviceId) {
    throw new HTTPException(400, { message: "Device ID is required" });
  }

  const maybeUser: User | null = deviceId ? await getUserByUID(deviceId) : null;
  const user = maybeUser ?? await createUser(deviceId);

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
    const user = await getUserByUID(payload.sub);

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
    const user = await getUserByUID(payload.sub);
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

// TODO: Use correct ticket proof scheme
const proofScheme = z.any();

const currentDir = dirname(fromFileUrl(import.meta.url));
const artifactsPath = join(
  currentDir,
  "../../.cache/npm/registry.npmjs.org/@pcd/proto-pod-gpc-artifacts/0.11.0",
);

app.post(
  "/api/v1/users/prove",
  zValidator("json", proofScheme),
  async (c) => {
    const ticketProof = c.req.valid("json");

    const proofConfig = ticketProof.proof;
    const boundConfig = boundConfigFromJSON(ticketProof.boundConfig);
    const revealedClaims = revealedClaimsFromJSON(ticketProof.revealedClaims);

    const verified = await gpcVerify(
      proofConfig,
      boundConfig,
      revealedClaims,
      artifactsPath,
    );

    if (!verified) {
      throw new HTTPException(401, { message: `Proof not valid` });
    }

    // TODO: Get public key from revealed claims
    const publicKey = "";

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

    const user = await getUserByUID(payload.sub);
    const blockedUser = await getUserByUID(uid);

    if (!user) {
      throw new HTTPException(404, {
        message: `User ${payload.sub} not found`,
      });
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
