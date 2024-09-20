import useSWR from "swr";
import useSWRSubscription from "swr/subscription";
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
  const { data, error, isLoading, mutate } = useSWR<{ data: Event }, HTTPError>(
    `/api/v1/events/${uid}`,
    fetcher,
  );

  return { data: data?.data, error, isLoading, mutate };
};

export const useEventUpdates = (
  uid: string | undefined,
  { onUpdate }: { onUpdate: (message: string) => void },
) => {
  const url = new URL(`/api/v1/events/${uid}/live`, globalThis.location.origin);
  url.protocol = url.protocol.replace("http", "ws");

  const { data, error } = useSWRSubscription(
    url.toString(),
    (key, { next }) => {
      const socket = new WebSocket(key);
      socket.addEventListener("message", (event) => {
        onUpdate(event.data);
        next(null, event.data);
      });
      socket.addEventListener("error", (event) => next((event as any).error));
      return () => socket.close();
    },
  );

  return {
    data,
    error,
  };
};
