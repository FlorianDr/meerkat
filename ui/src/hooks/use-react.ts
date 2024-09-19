import useSWRMutation from "swr/mutation";
import { HTTPError } from "./http-error.ts";

export const fetcher = async (endpoint: string) => {
  const res = await fetch(endpoint, {
    method: "POST",
  });
  if (!res.ok) {
    throw new HTTPError(res);
  }
  return res.json();
};

export function useReact(uid: string) {
  const { trigger } = useSWRMutation(
    `/api/v1/events/${uid}/react`,
    fetcher,
  );
  return { trigger };
}
