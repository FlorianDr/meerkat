import { EventCreate } from "../api/routes/conferences.ts";
import { getEvent, getSessions, type Session } from "./devcon.ts";
import { eventId } from "./constants.ts";
import { createConference, createEvents } from "./api.ts";
import { slice } from "./arrays.ts";

const event = await getEvent(eventId);
const sessions = await getSessions(eventId);

const conference = await createConference({ name: event.title });
console.info(`Created conference: ${conference.id}`);

// Max 50 events per request
const eventSlices = slice(sessions, 50);
for (const events of eventSlices) {
  await createEvents(
    conference.id,
    events.map(mapSessionToEvent),
  );
  console.info(`Created ${events.length} events`);
}

function mapSessionToEvent(session: Session): EventCreate {
  return {
    code: session.id,
    title: session.title,
    submissionType: session.type,
    start: new Date(session.slot_start),
    end: new Date(session.slot_end),
    abstract: session.description,
    description: session.description,
    track: session.track,
    speaker: session.speakers.map(({ name }) => name).join(", ") ?? "Unknown",
  };
}
