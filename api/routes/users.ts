import { Hono } from "@hono/hono";
import { jwt } from "@hono/hono/jwt";
import env from "../env.ts";
import { fromString, getSuffix } from "typeid-js";
import { SUB_TYPE_ID } from "../utils/jwt.ts";
import { getUserByUID } from "../models/user.ts";
import { HTTPException } from "@hono/hono/http-exception";

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

    const { id: _id, ...rest } = user;
    return c.json({ data: rest });
  },
);

export default app;
