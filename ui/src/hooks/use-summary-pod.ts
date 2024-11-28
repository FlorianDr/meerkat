import useSWRMutation from "swr/mutation";
import { poster } from "./fetcher.ts";

export function useSummaryPOD() {
  const { trigger } = useSWRMutation(
    `/api/v1/users/me/summary-pod`,
    poster,
  );

  return {
    trigger,
  };
}
