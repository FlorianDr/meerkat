import useSWR from "swr";
import { HTTPError } from "./http-error.ts";

export type Vote = {
  questionUid: number;
  userUid: number;
  createdAt: string;
};

const fetcher = () =>
  fetch(`/api/v1/users/me/votes`).then((res) => {
    if (!res.ok) {
      throw new HTTPError(res);
    }
    return res.json();
  });

export function useVotes() {
  const { data, error, isLoading } = useSWR<{ data: Vote[] }, HTTPError>(
    "votes",
    fetcher,
  );

  return { data: data?.data, error, isLoading };
}
