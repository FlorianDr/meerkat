import useSWR from "swr";
import { HTTPError } from "./http-error.ts";

// TDOO: Get interface from api
export type User = {
  uid: string;
  createdAt: Date;
};

const fetcher = () =>
  fetch("/api/v1/users/me").then((res) => {
    if (!res.ok) {
      throw new HTTPError(res);
    }
    return res.json();
  });

export const useUser = () => {
  const { data, error, isLoading } = useSWR<{ data: User }, HTTPError>(
    "/users/me",
    fetcher,
  );

  return {
    data: data?.data,
    error,
    isLoading,
  };
};
