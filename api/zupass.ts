import { constructZupassPcdAddRequestUrl } from "@pcd/passport-interface";
import { POD, podEntriesFromSimplifiedJSON } from "@pcd/pod";
import { PODPCD, PODPCDPackage } from "@pcd/pod-pcd";
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
    "code": event.uid,
    "track": event.track,
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
    env.zupassUrl,
    returnUrl.toString(),
    serializedPODPCD,
    podFolder,
    false,
  ));

  return addPODURL;
}
