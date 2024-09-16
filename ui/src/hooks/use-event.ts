import useSWR from "swr";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";

// TODO: Get interface from api
export type Event = {
  uid: string;
  code: string;
  title: string;
  submissionType: string;
  start: Date;
  end: Date;
  abstract: string | null;
  description: string | null;
  track: string | null;
  cover: string | null;
  questions: Question[];
  collectURL: string;
  proofURL: string;
  votes: number;
  participants: number;
  speaker: string;
};

export type Question = {
  uid: string;
  votes: number;
  question: string;
  createdAt: Date;
  user?: {
    uid: string;
    name?: string | undefined;
  } | undefined;
};

export const useEvent = (uid: string | undefined) => {
  const { data, error, isLoading } = useSWR<{ data: Event }, HTTPError>(
    `/api/v1/events/${uid}`,
    fetcher,
  );

  return { data: data?.data, error, isLoading };
};
