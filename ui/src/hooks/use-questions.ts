import useSWR from "swr";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";
import { Question } from "../types.ts";

export const useQuestions = (uid: string | undefined) => {
  const { data, error, isLoading, mutate } = useSWR<
    { data: Question[] },
    HTTPError
  >(
    uid ? `/api/v1/events/${uid}/questions` : undefined,
    fetcher,
    { fallbackData: { data: [] } },
  );

  return { data: data?.data, error, isLoading, mutate };
};
