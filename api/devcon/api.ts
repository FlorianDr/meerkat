import { devconApiBaseUrl } from "./constants.ts";

export type Reponse<Body> = {
  status: number;
  message: string;
  data: Body;
};

export type Pagination<Item> = {
  currentPage: number;
  total: number;
  items: Item[];
};

export type Event = {
  id: string;
  edition: number;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  venue_name: string;
  venue_description: string;
  venue_address: string;
  venue_website: string;
  venue_directions: string;
  version: string;
};

export async function getEvent(id: string) {
  const response = await fetch(`${devconApiBaseUrl}/events/${id}`, {
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }

  const body = await response.json() as Reponse<Event>;

  return body.data;
}

export type Session = {
  id: string;
  sourceId: string;
  title: string;
  description: string;
  track: string;
  type: string;
  expertise: string;
  featured: null | boolean;
  tags: string;
  duration: number;
  language: string;
  sources_youtubeId: string;
  sources_ipfsHash: string;
  sources_swarmHash: string;
  eventId: string;
  slot_start: string;
  slot_end: string;
  slot_roomId: string;
  resources_slides: string;
  speakers: Speaker[];
};

export type Speaker = {
  id: string;
  sourceId: string;
  name: string;
  avatar: string;
  description: string;
  twitter: string;
  farcaster: string;
  lens: string;
  ens: string;
  github: string;
  hash: string | null;
};

export async function getSessions(eventId: string) {
  const url = new URL(`${devconApiBaseUrl}/events/${eventId}/sessions`);

  url.searchParams.set("size", "1000");

  const response = await fetch(url, {
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
  }

  const body = await response.json() as Reponse<Pagination<Session>>;

  return body.data.items;
}
