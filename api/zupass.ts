import { POD, PODEntries } from "@pcd/pod";
import env from "./env.ts";
import type { Event } from "./models/events.ts";
import type { Conference } from "./models/conferences.ts";

const url = new URL(env.base);
const reversedDomain = url.hostname.split(".").reverse().join(".");

export function createAttendancePOD(
  conference: Conference,
  event: Event,
  owner: string,
) {
  const entries: PODEntries = {
    "owner": {
      type: "eddsa_pubkey",
      value: owner,
    },
    "pod_type": {
      type: "string",
      value: `${reversedDomain}/attendance`,
    },
    "version": {
      type: "string",
      value: "1.0.0",
    },
    "zupass_display": {
      type: "string",
      value: "collectable",
    },
    "zupass_image_url": {
      type: "string",
      value: event.cover ??
        "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/global/logo.png",
    },
    "zupass_title": {
      type: "string",
      value: event.title,
    },
    "zupass_description": {
      type: "string",
      value: event.description ?? "",
    },
    "start_date": {
      type: "date",
      value: event.start,
    },
    "end_date": {
      type: "date",
      value: event.end,
    },
    "conference": {
      type: "string",
      value: conference.name,
    },
    "track": {
      type: "string",
      value: event.track ?? "",
    },
    "code": {
      type: "string",
      value: event.uid,
    },
  };

  return POD.sign(entries, env.privateKey);
}

export function createSummaryPOD(
  conference: Conference,
  owner: string,
  stats: {
    rank: number;
    points: number;
    username: string;
    givenVotes: number;
    receivedVotes: number;
    questions: number;
    answeredQuestions: number;
    reactions: number;
  },
) {
  const description =
    `Devcon 7 SEA 🦄 was awesome! Thanks to your contribution 💜: ${stats.givenVotes} votes given, ${stats.receivedVotes} votes received, ${stats.questions} questions asked, ${stats.answeredQuestions} answered, ${stats.reactions} heart reactions. Your username is ${stats.username}.`;
  const entries: PODEntries = {
    "owner": {
      type: "eddsa_pubkey",
      value: owner,
    },
    "pod_type": {
      type: "string",
      value: `${reversedDomain}/summary`,
    },
    "version": {
      type: "string",
      value: "1.0.0",
    },
    "zupass_display": {
      type: "string",
      value: "collectable",
    },
    "zupass_image_url": {
      type: "string",
      value: getImageUrl(stats.rank),
    },
    "zupass_title": {
      type: "string",
      value: `Summary: ${conference.name}`,
    },
    "zupass_description": {
      type: "string",
      value: description,
    },
    "conference": {
      type: "string",
      value: conference.name,
    },
    "username": {
      type: "string",
      value: stats.username,
    },
    "given_votes": {
      type: "int",
      value: BigInt(stats.givenVotes),
    },
    "received_votes": {
      type: "int",
      value: BigInt(stats.receivedVotes),
    },
    "questions": {
      type: "int",
      value: BigInt(stats.questions),
    },
    "answered_questions": {
      type: "int",
      value: BigInt(stats.answeredQuestions),
    },
    "reactions": {
      type: "int",
      value: BigInt(stats.reactions),
    },
    "rank": {
      type: "int",
      value: BigInt(stats.rank),
    },
    "points": {
      type: "int",
      value: BigInt(stats.points),
    },
  };

  return POD.sign(entries, env.privateKey);
}

function getImageUrl(rank: number) {
  switch (rank) {
    case 1:
      return "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/winner-1stplace.png";
    case 2:
      return "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/winner-2ndplace.png";
    case 3:
      return "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/winner-3rdplace.png";
    default:
      return "https://icnyvghgspgzemdudsrd.supabase.co/storage/v1/object/public/images/naga-meerkat-devcon-leaderboard.png";
  }
}
