import useSWR from "swr";
import { useContext } from "react";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";
import { User } from "../types.ts";
import { UserContext } from "../context/user.tsx";

export const useUser = () => {
  const { user, setUser } = useContext(UserContext);
  const { data, error, isLoading, mutate } = useSWR<{ data: User }, HTTPError>(
    "/api/v1/users/me",
    fetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        setUser(data.data);
      },
    },
  );

  const resolvedUser = data?.data || user;

  return {
    data: resolvedUser,
    mutate,
    error,
    isLoading,
    isAuthenticated: !!resolvedUser,
    isBlocked: !isLoading && error?.status === 403,
  };
};
