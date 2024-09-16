import { Hono } from "@hono/hono";
import { jwt } from "@hono/hono/jwt";
import env from "../env.ts";
import { fromString, getSuffix } from "typeid-js";
import { SUB_TYPE_ID } from "../utils/jwt.ts";
import { getUserByUID } from "../models/user.ts";
import { HTTPException } from "@hono/hono/http-exception";
import { getVotesByUserId } from "../models/votes.ts";

const app = new Hono();

app.get(
  "/api/v1/users/me",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const payload = c.get("jwtPayload");
    const userUID = fromString(payload.sub as string, SUB_TYPE_ID);
    const user = await getUserByUID(getSuffix(userUID));

    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    const { id: _id, name, ...rest } = user;
    return c.json({
      data: {
        ...rest,
        name: name ?? undefined,
      },
    });
  },
);

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
        userUid: vote.user.uid,
        createdAt: vote.createdAt,
      };
    });

    return c.json({ data: apiVotes });
  },
);

export default app;
