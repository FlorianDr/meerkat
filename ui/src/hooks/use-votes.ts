import useSWR from "swr";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";

export type Vote = {
  questionUid: number;
  userUid: number;
  createdAt: string;
};

export function useVotes() {
  const { data, error, isLoading } = useSWR<{ data: Vote[] }, HTTPError>(
    `/api/v1/users/me/votes`,
    fetcher,
  );

  return { data: data?.data, error, isLoading };
}
