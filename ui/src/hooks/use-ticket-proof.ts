import { useContext, useState } from "react";
import { useZAPIConnect } from "../zapi/connect.ts";
import { User } from "../types.ts";
import { type ParcnetAPI } from "@parcnet-js/app-connector";
import {
  type TicketClassificationTuples,
  TicketProofRequest,
  ticketProofRequest,
} from "@parcnet-js/ticket-spec";
import { posthog } from "posthog-js";
import { UserContext } from "../context/user.tsx";
import { getConferenceTickets } from "./use-conference-tickets.ts";
import { useZAPI } from "../zapi/context.tsx";
import { constructTicketProofZapp } from "../zapi/zapps.ts";

export type UseTicketProofProps = {
  conferenceId?: number;
  onError?: (error: Error) => void;
};

export const minimumFieldsToReveal: TicketProofRequest["fieldsToReveal"] = {
  owner: true,
  eventId: true,
  productId: true,
};

export function useTicketProof(props: UseTicketProofProps) {
  const { setUser } = useContext(UserContext);
  const fieldsToReveal = minimumFieldsToReveal;
  const [isLoading, setLoading] = useState(false);
  const { connect } = useZAPIConnect();
  const { config } = useZAPI();

  const login = async () => {
    let user: User | undefined;
    let ticketProof: any;
    try {
      setLoading(true);
      if (!props.conferenceId) {
        throw new Error("Conference ID is required");
      }
      const tickets = await getConferenceTickets(props.conferenceId);
      const ticketCollectionsSet = new Set(
        tickets.map((ticket) => ticket.collectionName),
      );
      const ticketClassificationTuples = tickets.map((ticket) => ({
        eventId: ticket.eventId,
        signerPublicKey: ticket.signerPublicKey,
        ...(ticket.productId ? { productId: ticket.productId } : {}),
      }));
      const ticketCollections = Array.from(ticketCollectionsSet);
      const zapi = await connect(
        constructTicketProofZapp(config.zappName, ticketCollections),
      );
      ticketProof = await generateTicketProof(
        zapi,
        ticketClassificationTuples,
        fieldsToReveal,
      );
      user = await sendTicketProofRequest({ ticketProof });
      setUser(user);
      posthog.capture("user_logged_in");
    } catch (error) {
      props.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
    return { user, ticketProof };
  };

  return { login, isLoading };
}

async function sendTicketProofRequest(
  { ticketProof }: { ticketProof: ReturnType<typeof generateTicketProof> },
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

function generateTicketProof(
  zapi: ParcnetAPI,
  classificationTuples: TicketClassificationTuples,
  fieldsToReveal: TicketProofRequest["fieldsToReveal"],
) {
  const request = ticketProofRequest({
    classificationTuples,
    fieldsToReveal,
  });

  return zapi.gpc.prove({ request: request.schema });
}
