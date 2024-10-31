import { useContext, useState } from "react";
import { useZAPIConnect } from "../zapi/connect.ts";
import { User } from "../types.ts";
import { ParcnetAPI } from "@parcnet-js/app-connector";
import { ticketProofRequest } from "@parcnet-js/ticket-spec";
import {
  boundConfigToJSON,
  proofConfigToJSON,
  revealedClaimsToJSON,
} from "@pcd/gpc";
import { useUser } from "./use-user.ts";
import { ZAPIContext } from "../zapi/context.tsx";

export function useClaimEventCard() {
  const { isAuthenticated } = useUser();
  const [isLoading, setLoading] = useState(false);
  const { context } = useContext(ZAPIContext);
  const { isConnected } = useZAPIConnect();

  const { setEventCard } = useContext(EventCardContext);
  const [isLoading, setLoading] = useState(false);
  const { connect } = useZAPIConnect();

  const claimEventCard = async () => {
    try {
      setLoading(true);
      const zapi = await connect();
      const ticketProof = await proveTicket(zapi);
      const eventCard = await proveRequest({ ticketProof });
      setEventCard(eventCard);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { claimEventCard, isLoading };
}

async;
