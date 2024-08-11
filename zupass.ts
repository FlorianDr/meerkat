import { constructZupassPcdAddRequestUrl } from "@pcd/passport-interface";
import { PODPCD, PODPCDPackage } from "@pcd/pod-pcd";
import { POD, podEntriesFromSimplifiedJSON } from "@pcd/pod";
import { getSuffix } from "typeid-js";
import env from "./env.ts";
import type { Conference } from "./models/conferences.ts";
import type { Event } from "./models/events.ts";

export async function getZupassAddPCDURL(
  { conference, event, redirectURL }: {
    conference: Conference;
    event: Event;
    redirectURL: string;
  },
): Promise<URL> {
  // For examples, check: https://github.com/proofcarryingdata/zupass/blob/4dc89f0f65ad719edd22478bcc9f4887b5c1ac3a/apps/consumer-client/src/podExampleConstants.ts#L9
  const pod = {
    "zupass_display": "collectable",
    "zupass_image_url": event.cover ?? "",
    "zupass_title": event.title,
    "zupass_description": event.description ?? "",
  };
  const podContent = JSON.stringify(pod);
  const podFolder = conference?.name ?? "Conference";
  const newPOD = new PODPCD(
    getSuffix(event.uid),
    POD.sign(podEntriesFromSimplifiedJSON(podContent), env.privateKey),
  );

  const serializedPODPCD = await PODPCDPackage.serialize(newPOD);

  const addPODURL = new URL(constructZupassPcdAddRequestUrl(
    "https://zupass.org",
    redirectURL,
    serializedPODPCD,
    podFolder,
    false,
  ));

  return addPODURL;
}
