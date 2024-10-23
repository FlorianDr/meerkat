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
  >(isAuthenticated ? `/api/v1/users/me/roles` : undefined, fetcher);

  return { data: data?.data, error, isLoading, mutate };
}
