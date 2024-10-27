import { useContext } from "react";
import useSWRMutation from "swr/mutation";
import { UserContext } from "../context/user.tsx";
import { poster } from "./fetcher.ts";

export type UseReactReturnType = {
  trigger: (obj: { uid: string }) => void;
};

export function useReact(uid: string): UseReactReturnType {
  const { setIsOnCooldown } = useContext(UserContext);
  const { trigger } = useSWRMutation(`/api/v1/events/${uid}/react`, poster, {
    onError: (error) => {
      if (error.status === 429) {
        setIsOnCooldown(true);
      }
    },
  });

  return {
    trigger,
  };
}
