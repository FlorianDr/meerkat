import { POD, PODEntries } from "@pcd/pod";
import { PODPCD } from "@pcd/pod-pcd";
import env from "./env.ts";
import type { Event } from "./models/events.ts";
import type { Conference } from "./models/conferences.ts";

export function createPODPCD(
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
      value: "events.meerkat.attendance",
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
        "https://cdn.britannica.com/57/152457-050-1128A5FE/Meerkat.jpg",
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

  const pod = POD.sign(entries, env.privateKey);
  return new PODPCD(`att_${event.uid}`, pod);
}
