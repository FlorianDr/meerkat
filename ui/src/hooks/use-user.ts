import useSWR from "swr";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";

// TDOO: Get interface from api
export type User = {
  uid: string;
  createdAt: Date;
  name?: string | undefined;
};

export const useUser = () => {
  const { data, error, isLoading } = useSWR<{ data: User }, HTTPError>(
    "/api/v1/users/me",
    fetcher,
  );

  return {
    data: data?.data,
    error,
    isLoading,
    isAuthenticated: !isLoading && !!data,
  };
};
