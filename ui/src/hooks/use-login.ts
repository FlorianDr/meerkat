import { useContext, useState } from "react";
import { useZAPIConnect } from "../zapi/connect.ts";
import { UserContext } from "../context/user.tsx";
import { User } from "../types.ts";
import { ParcnetAPI } from "@parcnet-js/app-connector";
import {
  TicketProofRequest,
  ticketProofRequest,
} from "@parcnet-js/ticket-spec";
import { classificationTuples } from "./classification-tuples.ts";
import { POD } from "@pcd/pod";
import { DevconTicketSpec } from "./ticket-schema.ts";
import { HTTPError } from "./http-error.ts";

export type UseLoginProps = {
  fieldsToReveal?: TicketProofRequest["fieldsToReveal"] | undefined;
  onError?: (error: Error) => void;
};

export const minimumFieldsToReveal: TicketProofRequest["fieldsToReveal"] = {
  owner: true,
  eventId: true,
  productId: true,
};

export function useLogin(props?: UseLoginProps) {
  const fieldsToReveal = props?.fieldsToReveal ?? minimumFieldsToReveal;
  const { setUser } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const { connect } = useZAPIConnect();

  const login = async () => {
    let user: User | undefined;
    let ticketProof: any;
    try {
      setLoading(true);
      const zapi = await connect();
      // Ticket proof is slow rn
      // ticketProof = await proveTicket(
      //   zapi,
      //   fieldsToReveal,
      // );
      // user = await proveRequest({ ticketProof });
      const tickets = await (zapi as ParcnetAPI).pod.collection("Devcon SEA")
        .query(
          DevconTicketSpec,
        );

      const ticket = tickets[0];
      if (!ticket) {
        throw new Error("No ticket found");
      }
      const ticketPOD = POD.load(
        ticket.entries,
        ticket.signature,
        ticket.signerPublicKey,
      );

      const proofOfIdentity = await zapi.pod.signPrefixed({
        _UNSAFE_ticketId: {
          type: "string",
          value: ticket.entries.ticketId.value.toString(),
        },
      });

      const proofOfIdentityPOD = POD.load(
        proofOfIdentity.entries,
        proofOfIdentity.signature,
        proofOfIdentity.signerPublicKey,
      );

      const user = await sendPods(ticketPOD, proofOfIdentityPOD);
      setUser(user);
    } catch (error) {
      props?.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
    return { user, ticketProof };
  };

  return { login, isLoading };
}

async function proveRequest(
  { ticketProof }: { ticketProof: any },
) {
  const {
    boundConfigToJSON,
    revealedClaimsToJSON,
  } = await import("@pcd/gpc");
  const response = await fetch("/api/v1/users/prove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proof: ticketProof.proof,
      revealedClaims: revealedClaimsToJSON(ticketProof.revealedClaims),
      boundConfig: boundConfigToJSON(ticketProof.boundConfig),
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to login");
  }
  const { data: { user } } = await response.json();
  return user as User;
}

function proveTicket(
  zapi: ParcnetAPI,
  fieldsToReveal: TicketProofRequest["fieldsToReveal"],
) {
  const request = ticketProofRequest({
    classificationTuples,
    fieldsToReveal,
  });

  return zapi.gpc.prove({ request: request.schema });
}

async function sendPods(
  ticketPOD: POD,
  proofOfIdentityPOD: POD,
) {
  const res = await fetch("/api/v1/users/login/pods", {
    method: "POST",
    body: JSON.stringify({
      serializedTicket: ticketPOD.toJSON(),
      serializedProofOfIdentity: proofOfIdentityPOD.toJSON(),
    }),
  });
  if (!res.ok) {
    throw new HTTPError(res);
  }
  const { data: { user } } = await res.json();
  return user as User;
}
