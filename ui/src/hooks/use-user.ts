import useSWR from "swr";
import { useContext } from "react";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";
import { User } from "../types.ts";
import { UserContext } from "../context/user.tsx";

export const useUser = () => {
  const { user, setUser } = useContext(UserContext);
  const { error, isLoading } = useSWR<{ data: User }, HTTPError>(
    "/api/v1/users/me",
    fetcher,
    {
      onSuccess: (data) => {
        setUser(data.data);
      },
    },
  );

  return {
    data: user,
    error,
    isLoading,
    isAuthenticated: !isLoading && !!user,
    isBlocked: !isLoading && error?.status === 403,
  };
};
