import useSWRMutation from "swr/mutation";
import { poster } from "./fetcher.ts";
import { Event } from "../types.ts";
import { useContext } from "react";
import { UserContext } from "../context/user.tsx";
import { HTTPError } from "./http-error.ts";

export const useAskQuestion = (event: Event | undefined, {
  onSuccess,
  onError,
}: { onSuccess: () => void; onError: (error: HTTPError) => void }) => {
  const { setIsOnCooldown } = useContext(UserContext);
  const { trigger } = useSWRMutation<{ data: any }, HTTPError>(
    event ? `/api/v1/events/${event.uid}/questions` : undefined,
    poster,
    {
      onSuccess,
      onError: (error) => {
        if (error.status === 429) {
          setIsOnCooldown(true);
        } else {
          onError(error);
        }
      },
    },
  );

  return {
    trigger,
  };
};
