import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { Event } from "../types.ts";
import { POD } from "@pcd/pod";
import { useZAPIConnect } from "../zapi/connect.ts";
import { poster } from "./fetcher.ts";
import { useZAPI } from "../zapi/context.tsx";

export function useCollect(event: Event | undefined, secret: string | null) {
  const [isCollecting, setIsCollecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { connect } = useZAPIConnect();
  const { config } = useZAPI();
  const { trigger } = useAttendancePOD(event);

  const collect = async () => {
    setIsCollecting(true);
    setError(null);
    try {
      const zapi = await connect();
      const { data } = await trigger({ secret });
      const pod = POD.fromJSON(data);
      await zapi.pod
        .collection(`${config.zapp.name}: Devcon SEA`)
        .insert({
          entries: pod.content.asEntries(),
          signature: pod.signature,
          signerPublicKey: pod.signerPublicKey,
        });
    } catch (error) {
      setError(error as Error);
    } finally {
      setIsCollecting(false);
    }
  };

  return {
    collect,
    isCollecting,
    error,
  };
}

function useAttendancePOD(event: Event | undefined) {
  const { trigger } = useSWRMutation(
    event ? `/api/v1/events/${event.uid}/attendance` : null,
    poster,
  );

  return {
    trigger,
  };
}
