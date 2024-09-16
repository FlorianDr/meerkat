import {
  constructZupassPcdAddRequestUrl,
  type PipelineEdDSATicketZuAuthConfig,
} from "@pcd/passport-interface";
import { POD, podEntriesFromSimplifiedJSON } from "@pcd/pod";
import { PODPCD, PODPCDPackage } from "@pcd/pod-pcd";
import { constructZkTicketProofUrl } from "@pcd/zuauth/client";
import { authenticate } from "@pcd/zuauth/server";
import env from "./env.ts";
import type { Conference } from "./models/conferences.ts";
import type { Event } from "./models/events.ts";

export async function getZupassAddPCDURL(
  { conference, event, origin }: {
    conference: Conference;
    event: Event;
    origin: string;
  },
): Promise<URL> {
  // For examples, check: https://github.com/proofcarryingdata/zupass/blob/4dc89f0f65ad719edd22478bcc9f4887b5c1ac3a/apps/consumer-client/src/podExampleConstants.ts#L9
  const pod = {
    "zupass_display": "collectable",
    "zupass_image_url": event.cover ??
      "https://cdn.britannica.com/57/152457-050-1128A5FE/Meerkat.jpg",
    "zupass_title": event.title,
    "zupass_description": event.description ?? "",
  };
  const podContent = JSON.stringify(pod);
  const podFolder = conference?.name ?? "Conference";
  const newPOD = new PODPCD(
    event.uid,
    POD.sign(podEntriesFromSimplifiedJSON(podContent), env.privateKey),
  );

  const returnUrl = new URL(`/events/${event.uid}/qa`, origin);
  const serializedPODPCD = await PODPCDPackage.serialize(newPOD);

  const addPODURL = new URL(constructZupassPcdAddRequestUrl(
    "https://zupass.org",
    returnUrl.toString(),
    serializedPODPCD,
    podFolder,
    false,
  ));

  return addPODURL;
}

export function generateProofURL(
  watermark: bigint,
  returnUrl: string,
  config: PipelineEdDSATicketZuAuthConfig[],
) {
  const proofURL = constructZkTicketProofUrl({
    returnUrl,
    fieldsToReveal: {
      revealTicketId: true,
      revealEventId: true,
    },
    watermark,
    proofTitle: "Prove event attendance",
    config,
  });
  return proofURL;
}

export async function checkProof(
  proof: string,
  watermark: bigint,
  conference: Conference,
) {
  const ticketPCD = await authenticate(proof, {
    watermark,
    // For now, we have to use the watermark as the external nullifier
    externalNullifier: watermark,
    config: conference.zuAuthConfig,
    fieldsToReveal: {
      revealTicketId: true,
      revealEventId: true,
    },
  });
  return ticketPCD;
}
