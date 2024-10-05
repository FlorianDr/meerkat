import useSWR from "swr";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";
import { useUser } from "./use-user.ts";

export type ConferenceRole = {
  conferenceId: number;
  role: "anonymous" | "attendee" | "organizer";
  grantedAt: Date;
};

export function useConferenceRoles() {
  const { isAuthenticated } = useUser();

  const { data, error, isLoading, mutate } = useSWR<
    { data: ConferenceRole[] },
    HTTPError
  >(`/api/v1/users/me/roles`, isAuthenticated ? fetcher : null);

  return { data: data?.data, error, isLoading, mutate };
}
