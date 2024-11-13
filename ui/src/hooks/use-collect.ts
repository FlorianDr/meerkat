import useSWRMutation from "swr/mutation";
import { Event } from "../types.ts";
import { POD } from "@pcd/pod";
import { poster } from "./fetcher.ts";
import { useZAPI } from "../zapi/context.tsx";
import { posthog } from "posthog-js";

export function useCollect(event: Event | undefined, secret: string | null) {
  const { config } = useZAPI();
  const { trigger } = useAttendancePOD(event);

  const collect = async (zapi: ParcnetAPI) => {
    const { data } = await trigger({ secret });
    const pod = POD.fromJSON(data);
    await zapi.pod
      .collection(`${config.zapp.name}: Devcon SEA`)
      .insert({
        entries: pod.content.asEntries(),
        signature: pod.signature,
        signerPublicKey: pod.signerPublicKey,
      });
    posthog.capture("attendance_collected", {
      event_uid: event?.uid,
    });
  };

  return {
    collect,
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
