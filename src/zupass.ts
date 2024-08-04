// import { constructZupassPcdAddRequestUrl } from "@pcd/passport-interface";
// import { PODPCD, PODPCDPackage } from "@pcd/pod-pcd";
// import { POD, podEntriesFromSimplifiedJSON } from "@pcd/pod";
import { typeid } from "typeid-js";
import type { Conference, Event } from "./models/conferences.ts";

export async function getZupassAddPCDURL(
  { conference, event, redirectURL }: {
    conference: Conference;
    event: Event;
    redirectURL: string;
  },
): Promise<URL> {
  // For examples, check: https://github.com/proofcarryingdata/zupass/blob/4dc89f0f65ad719edd22478bcc9f4887b5c1ac3a/apps/consumer-client/src/podExampleConstants.ts#L9
  // const pod = {
  // 	"zupass_display": "collectable",
  // 	"zupass_image_url":
  // 		"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Felis_catus-cat_on_snow.jpg/358px-Felis_catus-cat_on_snow.jpg",
  // 	"zupass_title": "friendly kitty",
  // 	"zupass_description": "friendly kitty says hello",
  // 	"owner":
  // 		18711405342588116796533073928767088921854096266145046362753928030796553161041,
  // };
  // const podContent = JSON.stringify(pod);
  // const podPrivateKey =
  // 	"0001020304050607080900010203040506070809000102030405060708090001";
  // const podFolder = conference?.name ?? "Conference";
  // const newPOD = new PODPCD(
  // 	typeid().toUUID(),
  // 	POD.sign(podEntriesFromSimplifiedJSON(podContent), podPrivateKey),
  // );

  // const serializedPODPCD = await PODPCDPackage.serialize(newPOD);

  // const addPODURL = new URL(constructZupassPcdAddRequestUrl(
  // 	"https://zupass.org",
  // 	redirectURL,
  // 	serializedPODPCD,
  // 	podFolder,
  // 	false,
  // ));

  const addPODURL = new URL("https://zupass.org");

  return addPODURL;
}
