import useSWR from "swr";
import useSWRSubscription from "swr/subscription";
import { HTTPError } from "./http-error.ts";
import { fetcher } from "./fetcher.ts";

// TODO: Get interface from api
export type Conference = {
  id: number;
  name: string;
  logoUrl: string | null;
};

export type Event = {
  uid: string;
  conferenceId: number;
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
  votes: number;
  participants: number;
  speaker: string;
  conference: Conference;
};

export type Question = {
  uid: string;
  votes: number;
  question: string;
  createdAt: Date;
  answeredAt?: Date | undefined;
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
    uid ? url.toString() : undefined,
    (key, { next }) => {
      const socket = new SturdyWebsocket(key);
      socket.onMessage((message) => {
        onUpdate(message);
        next(null, message);
      });
      socket.onError((error) => next(error));
      socket.connect();
      return () => socket.close();
    },
  );

  return {
    data,
    error,
  };
};

export class SturdyWebsocket {
  socket: WebSocket | undefined;
  heartbeatInterval: number | undefined;
  reconnectOnClose = true;
  onMessageCallbacks: ((message: string) => void)[] = [];
  onErrorCallbacks: ((error: any) => void)[] = [];
  awaitingPong = false;
  static PING_INTERVAL = 10_000;
  retries = 0;

  constructor(private url: string) {}

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("open", this._onOpen.bind(this));
    this.socket.addEventListener("close", this._onClose.bind(this));
    this.socket.addEventListener("error", this._onError.bind(this));
    this.socket.addEventListener("message", this._onMessage.bind(this));
    this.reconnectOnClose = true;
  }

  close() {
    this.socket?.close();
    this.reconnectOnClose = false;
    this._onClose();
  }

  onMessage(handler: (mesage: string) => void) {
    this.onMessageCallbacks.push(handler);
  }

  onError(handler: (error: any) => void) {
    this.onErrorCallbacks.push(handler);
  }

  private _onOpen() {
    this.heartbeatInterval = setInterval(() => {
      if (this.awaitingPong) {
        this.close();
        this.connect();
        return;
      }
      this.socket?.send("ping");
      this.awaitingPong = true;
    }, SturdyWebsocket.PING_INTERVAL);
  }

  private _onError(e: any) {
    this.onErrorCallbacks.forEach((cb) => cb(e));
  }

  private _onMessage(event: MessageEvent<any>) {
    if (event.data === "pong") {
      this.awaitingPong = false;
      return;
    }

    if (event.data === "ping") {
      this.socket?.send("pong");
      return;
    }

    this.onMessageCallbacks.forEach((cb) => cb(event.data));
  }

  private _onClose() {
    clearInterval(this.heartbeatInterval);

    if (this.reconnectOnClose && this.retries < 10) {
      this.connect();
      this.retries++;
    }
  }
}
