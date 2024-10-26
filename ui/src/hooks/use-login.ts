import { useContext, useState } from "react";
import { useZAPIConnect } from "../zapi/connect.ts";
import { UserContext } from "../context/user.tsx";
import { User } from "../types.ts";
import { ParcnetAPI } from "@parcnet-js/app-connector";
import {
  TicketProofRequest,
  ticketProofRequest,
} from "@parcnet-js/ticket-spec";
import {
  boundConfigToJSON,
  proofConfigToJSON,
  revealedClaimsToJSON,
} from "@pcd/gpc";

export function useLogin() {
  const { setUser } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const { connect } = useZAPIConnect();

  const login = async () => {
    try {
      setLoading(true);
      const zapi = await connect();
      const publicKey = await zapi.identity.getPublicKey();
      const user = await loginRequest(publicKey);
      // TODO: Use ticket proofing when it works :)
      // const ticketProof = await proveTicket(zapi);
      // const user = await proveRequest({ ticketProof });
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { login, isLoading };
}

async function loginRequest(publicKey: string) {
  const response = await fetch("/api/v1/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ publicKey }),
  });
  if (!response.ok) {
    throw new Error("Failed to login");
  }
  const { data: { user } } = await response.json();
  return user as User;
}

async function proveRequest(
  { ticketProof }: { ticketProof: any },
) {
  const response = await fetch("/api/v1/users/prove", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      proof: proofConfigToJSON(ticketProof.proof),
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

function proveTicket(zapi: ParcnetAPI) {
  const request = ticketProofRequest({
    classificationTuples: [
      {
        signerPublicKey: "YwahfUdUYehkGMaWh0+q3F8itx2h8mybjPmt8CmTJSs",
        eventId: "5074edf5-f079-4099-b036-22223c0c6995",
      },
    ],
    fieldsToReveal: ({
      owner: true,
    }) as TicketProofRequest["fieldsToReveal"] & { owner?: boolean },
  });

  return zapi.gpc.prove({ request: request.schema });
}
