import useSWR from "swr";
import { HTTPError } from "./http-error.ts";

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
  questions: QuestionWithVotes[];
  collectURL: string;
  proofURL: string;
};

type Question = {
  uid: string;
  votes: number;
  question: string;
  createdAt: Date;
  userId: number;
};

export type QuestionWithVotes = Question & { votes: number; hasVoted: boolean };

const fetcher = (uid: string) =>
  fetch(`/api/v1/events/${uid}`).then((res) => {
    if (!res.ok) {
      throw new HTTPError(res);
    }
    return res.json();
  });

export const useEvent = (uid: string | undefined) => {
  const { data, error, isLoading } = useSWR<{ data: Event }, HTTPError>(
    uid,
    fetcher,
  );

  return { data: data?.data, error, isLoading };
};
