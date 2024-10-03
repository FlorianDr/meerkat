import useSWRMutation from "swr/mutation";
import { poster } from "./fetcher.ts";

export function useMarkAsAnswered(uid: string) {
  const { trigger } = useSWRMutation(
    `/api/v1/questions/${uid}/mark-as-answered`,
    poster,
  );
  return { trigger };
}
