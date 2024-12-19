import { ConferenceTicket } from "../types.ts";
import { extractHTTPError } from "./request.ts";

export async function getConferenceTickets(
  conferenceId: number,
): Promise<ConferenceTicket[]> {
  const response = await fetch(`/api/v1/conferences/${conferenceId}/tickets`);
  if (!response.ok) {
    throw await extractHTTPError(response);
  }
  const { data: tickets } = await response.json();
  return tickets;
}
