import useSWRMutation from "swr/mutation";
import { poster } from "./fetcher.ts";
import { Event } from "../types.ts";
import { useContext } from "react";
import { UserContext } from "../context/user.tsx";

export const useAskQuestion = (event: Event | undefined, {
  onSuccess,
}: { onSuccess: () => void }) => {
  const { setIsOnCooldown } = useContext(UserContext);
  const { trigger } = useSWRMutation(
    event ? `/api/v1/events/${event.uid}/questions` : undefined,
    poster,
    {
      onSuccess,
      onError: (error) => {
        if (error.status === 429) {
          setIsOnCooldown(true);
        }
      },
    },
  );

  return {
    trigger,
  };
};
