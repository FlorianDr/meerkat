import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { poster } from "./fetcher.ts";

type ReactReturnType = {
  trigger: () => Promise<void>;
  isOnCooldown: boolean;
};

export function useReact(uid: string): ReactReturnType {
  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);
  const { trigger } = useSWRMutation(
    `/api/v1/events/${uid}/react`,
    poster,
    {
      onError: (error) => {
        if (error.status === 403) {
          setIsOnCooldown(true);
        }
      },
    },
  );

  return { trigger, isOnCooldown };
}
