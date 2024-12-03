import { z } from "zod";
import { Hono } from "@hono/hono";
import { jwt, sign } from "@hono/hono/jwt";
import env from "../env.ts";
import { constructJWTPayload } from "../utils/jwt.ts";
import { setJWTCookie } from "../utils/cookie.ts";
import {
  countAnsweredQuestions,
  countQuestions,
  countReactions,
  countReceivedVotes,
  countVotes,
  getAccounts,
  getTopContributors,
  getUserByProvider,
  getUserByUID,
  getUserContributionRank,
  updateUserEmail,
  ZUPASS_PROVIDER,
} from "../models/user.ts";
import { HTTPException } from "@hono/hono/http-exception";
import { getVotesByUserId } from "../models/votes.ts";
import { zValidator } from "@hono/zod-validator";
import { deleteCookie } from "@hono/hono/cookie";
import { createUserFromAccount, markUserAsBlocked } from "../models/user.ts";
import {
  getConferenceRoles,
  getConferenceRolesForConference,
  grantRole,
} from "../models/roles.ts";
import {
  getConferenceById,
  getConferenceByTicket,
} from "../models/conferences.ts";
import { hash } from "../utils/secret.ts";
import { POD } from "@pcd/pod";
import { TicketSpec } from "@parcnet-js/ticket-spec";
import { createSummaryPOD } from "../zupass.ts";

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

    const rankAndPoints = await getUserContributionRank(user.id);

    const { id: _id, blocked: _blocked, ...rest } = user;

    return c.json({
      data: { ...rest, ...rankAndPoints },
    });
  },
);

// TOOO: Disallow creating new anonymous users for now
// app.post("/api/v1/users", async (c) => {
//   const deviceId = getCookie(c, "deviceId");

//   if (!deviceId) {
//     throw new HTTPException(400, { message: "Device ID is required" });
//   }

//   const maybeUser: User | null = deviceId ? await getUserByUID(deviceId) : null;
//   const user = maybeUser ?? await createUser(deviceId);

//   const origin = c.req.header("origin") ?? env.base;
//   const payload = constructJWTPayload(user);
//   const token = await sign(payload, env.secret);

//   const baseUrl = new URL(origin);
//   setCookie(c, "jwt", token, {
//     path: "/",
//     domain: baseUrl.hostname,
//     secure: baseUrl.protocol === "https:",
//     httpOnly: true,
//     maxAge: JWT_EXPIRATION_TIME,
//     sameSite: "strict",
//   });

//   const { id: _id, blocked: _blocked, name, ...rest } = user;

//   return c.json({
//     data: {
//       ...rest,
//       name: name ?? undefined,
//     },
//   });
// });

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

app.get(
  "/api/v1/users/me/stats",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const payload = c.get("jwtPayload");
    const user = await getUserByUID(payload.sub);
    if (!user) {
      throw new HTTPException(401, { message: `User not found` });
    }

    const [votes, questions, answeredQuestions, reactions, receivedVotes] =
      await Promise.all([
        countVotes(user.id),
        countQuestions(user.id),
        countAnsweredQuestions(user.id),
        countReactions(user.id),
        countReceivedVotes(user.id),
      ]);

    return c.json({
      data: {
        votes,
        questions,
        answeredQuestions,
        reactions,
        receivedVotes,
      },
    });
  },
);

// TODO: Deactivate public key login for now
// const usersLoginScheme = z.object({
//   publicKey: z.string(),
// });

// app.post(
//   "/api/v1/users/login",
//   zValidator("json", usersLoginScheme),
//   async (c) => {
//     const { publicKey } = c.req.valid("json");

//     let user = await getUserByProvider("zupass", publicKey);

//     if (!user) {
//       user = await createUserFromAccount({
//         provider: "zupass",
//         id: publicKey,
//       });
//     }

//     const origin = c.req.header("origin") ?? env.base;
//     const payload = constructJWTPayload(user);
//     const token = await sign(payload, env.secret);

//     const baseUrl = new URL(origin);
//     setCookie(c, "jwt", token, {
//       path: "/",
//       domain: baseUrl.hostname,
//       secure: baseUrl.protocol === "https:",
//       httpOnly: true,
//       maxAge: JWT_EXPIRATION_TIME,
//       sameSite: "Lax",
//     });

//     return c.json({ data: { user } });
//   },
// );

// TODO: Use correct ticket proof scheme
const proofScheme = z.any();

const ROLE_HIERARCHY = ["attendee", "speaker", "organizer"];

app.post(
  "/api/v1/users/prove",
  zValidator("json", proofScheme),
  async (c) => {
    const ticketProof = c.req.valid("json");

    const response = await fetch(`${env.verifierEndpoint}/verify`, {
      body: JSON.stringify(ticketProof),
      method: "POST",
    });

    if (!response.ok) {
      throw new HTTPException(500, { message: "Failed to verify proof" });
    }

    const body = await response.json();

    if (!body.data.verified) {
      throw new HTTPException(400, { message: "Prove is invalid" });
    }

    const signerPublicKey = ticketProof.revealedClaims.pods.ticket
      .signerPublicKey as string;
    const eventId = ticketProof.revealedClaims.pods.ticket.entries
      .eventId as string;
    const productId = ticketProof.revealedClaims.pods.ticket.entries
      .productId as string;
    const publicKey =
      ticketProof.revealedClaims.pods.ticket.entries.owner.eddsa_pubkey;

    const email = ticketProof.revealedClaims.pods.ticket.entries.attendeeEmail;

    const result = await getConferenceByTicket(
      eventId,
      signerPublicKey,
      productId,
    );

    if (!result) {
      throw new HTTPException(400, { message: "Ticket not found" });
    }

    let user = await getUserByProvider(ZUPASS_PROVIDER, publicKey);
    const hashValue = email ? await hash(env.emailSecret, email) : null;

    if (!user) {
      user = await createUserFromAccount({
        provider: ZUPASS_PROVIDER,
        id: publicKey,
        hash: hashValue,
      });
    } else if (hashValue) {
      await updateUserEmail(user.id, hashValue);
    }

    const conferenceRoles = await getConferenceRolesForConference(
      user.id,
      result.conference_tickets.conferenceId,
    );

    const conference = result.conferences;
    const role = result.conference_tickets.role;

    const newRoleIndex = ROLE_HIERARCHY.indexOf(role);
    const currentRoleIndex = conferenceRoles.reduce((acc, role) => {
      return Math.max(acc, ROLE_HIERARCHY.indexOf(role.role));
    }, -1);

    if (newRoleIndex > currentRoleIndex) {
      await grantRole(user.id, conference.id, role);
    }

    const payload = constructJWTPayload(user);
    const jwtString = await sign(payload, env.secret);
    setJWTCookie(c, jwtString);

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

app.post(
  "/api/v1/users/login/pods",
  async (c) => {
    const { serializedTicket, serializedProofOfIdentity } = await c.req.json();
    const ticketPOD = POD.fromJSON(serializedTicket);
    const proofOfIdentityPOD = POD.fromJSON(serializedProofOfIdentity);

    let publicKey: string | null = null;
    let email: string | null = null;
    let eventId: string | null = null;
    let signerPublicKey: string | null = null;
    let productId: string | null = null;
    let verified = false;
    try {
      const valid = ticketPOD.verifySignature();
      if (valid) {
        const { isValid } = DevconTicketSpec.safeParse(ticketPOD);
        verified = isValid;
      }
      if (verified) {
        publicKey = ticketPOD.content.asEntries().owner.value as string;
        email = ticketPOD.content.asEntries().attendeeEmail.value as string;
        eventId = ticketPOD.content.asEntries().eventId.value as string;
        signerPublicKey = ticketPOD.signerPublicKey;
        productId = ticketPOD.content.asEntries().productId.value as string;
        verified = proofOfIdentityPOD.signerPublicKey ===
            ticketPOD.content.asEntries().owner.value &&
          proofOfIdentityPOD.content.asEntries()._UNSAFE_ticketId.value ===
            ticketPOD.content.asEntries().ticketId.value;
      }
    } catch (e) {
      throw new HTTPException(400, { message: "Invalid proof" });
    }

    if (!publicKey) {
      throw new HTTPException(400, { message: "Public key not found" });
    }

    if (!eventId) {
      throw new HTTPException(400, { message: "Event ID not found" });
    }

    if (!signerPublicKey) {
      throw new HTTPException(400, { message: "Signer public key not found" });
    }

    if (!productId) {
      throw new HTTPException(400, { message: "Product ID not found" });
    }

    const result = await getConferenceByTicket(
      eventId,
      signerPublicKey,
      productId,
    );

    if (!result) {
      throw new HTTPException(400, { message: "Ticket not found" });
    }

    let user = await getUserByProvider(ZUPASS_PROVIDER, publicKey);
    const hashValue = email ? await hash(env.emailSecret, email) : null;

    if (!user) {
      user = await createUserFromAccount({
        provider: ZUPASS_PROVIDER,
        id: publicKey,
        hash: hashValue,
      });
    } else if (hashValue) {
      await updateUserEmail(user.id, hashValue);
    }

    const conferenceRoles = await getConferenceRolesForConference(
      user.id,
      result.conference_tickets.conferenceId,
    );

    const conference = result.conferences;
    const role = result.conference_tickets.role;

    const newRoleIndex = ROLE_HIERARCHY.indexOf(role);
    const currentRoleIndex = conferenceRoles.reduce((acc, role) => {
      return Math.max(acc, ROLE_HIERARCHY.indexOf(role.role));
    }, -1);

    if (newRoleIndex > currentRoleIndex) {
      await grantRole(user.id, conference.id, role);
    }

    const payload = constructJWTPayload(user);
    const jwtString = await sign(payload, env.secret);
    setJWTCookie(c, jwtString);

    const rankAndPoints = await getUserContributionRank(user.id);

    return c.json({ data: { ...user, ...rankAndPoints } });
  },
);

app.get("/api/v1/users/leaderboard", async (c) => {
  const topContributors = await getTopContributors(10);

  // Map the results to only expose necessary information
  const leaderboard = topContributors.map((user) => ({
    name: user.name,
    points: user.points,
    rank: user.rank,
  }));

  return c.json({
    data: leaderboard,
  });
});

export const DevconTicketSpec = TicketSpec.extend((schema, f) => {
  return f({
    ...schema,
    entries: {
      ...schema.entries,
      // Make sure the ticket is for the Devcon event
      eventId: {
        type: "string",
        isMemberOf: [
          { type: "string", value: "5074edf5-f079-4099-b036-22223c0c6995" },
        ],
      },
      // Exclude add-on tickets
      isAddon: {
        type: "optional",
        innerType: {
          type: "int",
          isNotMemberOf: [{ type: "int", value: BigInt(1) }],
        },
      },
    },
    signerPublicKey: {
      // Must be the public key of the Devcon Podbox pipeline
      isMemberOf: ["YwahfUdUYehkGMaWh0+q3F8itx2h8mybjPmt8CmTJSs"],
    },
  });
});

// TODO: It should not rely on id in different tables. fix me please.
const DEVCON_ID = 1;

app.post(
  "/api/v1/users/me/summary-pod",
  jwt({ secret: env.secret, cookie: "jwt" }),
  async (c) => {
    const payload = c.get("jwtPayload");
    const user = await getUserByUID(payload.sub);

    if (!user) {
      throw new HTTPException(401, { message: "User not found" });
    }

    const zupassAccount = await getAccounts(user.id);
    const zupassId = zupassAccount?.find((a) => a.provider === ZUPASS_PROVIDER)
      ?.id;

    if (!zupassId) {
      throw new HTTPException(400, {
        message: `User ${user.uid} does not have a Zupass account`,
      });
    }

    const conference = await getConferenceById(DEVCON_ID);

    if (!conference) {
      throw new HTTPException(400, { message: "Conference not found" });
    }

    const roles = await getConferenceRolesForConference(
      user.id,
      conference.id,
    );

    if (roles.length === 0) {
      throw new HTTPException(403, { message: "User has no conference roles" });
    }

    const [
      votes,
      questions,
      answeredQuestions,
      reactions,
      receivedVotes,
      rank,
    ] = await Promise.all([
      countVotes(user.id),
      countQuestions(user.id),
      countAnsweredQuestions(user.id),
      countReactions(user.id),
      countReceivedVotes(user.id),
      getUserContributionRank(user.id),
    ]);

    const pod = createSummaryPOD(conference, zupassId, {
      username: user.name ?? "Anonymous",
      givenVotes: votes,
      receivedVotes,
      questions,
      answeredQuestions,
      reactions,
      rank: rank.rank,
      points: rank.points,
    });

    return c.json({
      data: pod.toJSON(),
    });
  },
);

app.post("/api/v1/users/logout", async (c) => {
  const origin = c.req.header("origin") ?? env.base;
  const baseUrl = new URL(origin);

  deleteCookie(c, "jwt", {
    path: "/",
    domain: baseUrl.hostname,
    secure: baseUrl.protocol === "https:",
    httpOnly: true,
    maxAge: JWT_EXPIRATION_TIME,
    sameSite: "strict",
  });

  return c.json({ data: {} });
});

export default app;
