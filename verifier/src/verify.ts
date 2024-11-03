import {
  boundConfigFromJSON,
  gpcVerify,
  revealedClaimsFromJSON,
} from "@pcd/gpc";
import { join } from "node:path";

const artifactsPath = join(
  __dirname,
  "../node_modules/@pcd/proto-pod-gpc-artifacts",
);

export async function verifyTicketProof(ticketProof: any) {
  const proofConfig = ticketProof.proof;
  const boundConfig = boundConfigFromJSON(ticketProof.boundConfig);
  const revealedClaims = revealedClaimsFromJSON(ticketProof.revealedClaims);
  const verified = await gpcVerify(
    proofConfig,
    boundConfig,
    revealedClaims,
    artifactsPath,
  );

  return verified;
}
