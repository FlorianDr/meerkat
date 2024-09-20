import useSWR from "swr";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";
import { useUser } from "./use-user.ts";

export type Vote = {
  questionUid: number;
  userUid: number;
  createdAt: string;
};

export function useVotes() {
  const { isAuthenticated } = useUser();

  const { data, error, isLoading, mutate } = useSWR<
    { data: Vote[] },
    HTTPError
  >(
    `/api/v1/users/me/votes`,
    isAuthenticated ? fetcher : null,
  );

  return { data: data?.data, error, isLoading, mutate };
}
