import "@std/dotenv/load";

import { ConferenceCreate, EventCreate } from "../api/routes/conferences.ts";

const secret = Deno.env.get("ADMIN_TOKEN");
const meerkatApiBaseUrl = Deno.env.get("BASE_URL");

if (!secret || !meerkatApiBaseUrl) {
  throw new Error(
    "Make sure to create a .env file with ADMIN_TOKEN and BASE_URL",
  );
}

export async function createConference(conference: ConferenceCreate) {
  const reponse = await fetch(`${meerkatApiBaseUrl}/api/v1/conferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${secret}`,
    },
    body: JSON.stringify(conference),
  });

  if (!reponse.ok) {
    throw new Error(
      `Failed to create conference: ${reponse.status} ${await reponse.text()}`,
    );
  }

  const { data } = await reponse.json();
  return data;
}

export async function createEvents(
  conferenceId: number,
  events: EventCreate[],
) {
  const reponse = await fetch(
    `${meerkatApiBaseUrl}/api/v1/conferences/${conferenceId}/events`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${secret}`,
      },
      body: JSON.stringify(events),
    },
  );

  if (!reponse.ok) {
    throw new Error(
      `Failed to create events: ${reponse.status} ${await reponse.text()}`,
    );
  }

  const { data } = await reponse.json();
  return data;
}
