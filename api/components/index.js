import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.6";
import * as Sentry from "https://esm.sh/@sentry/browser@8.36.0";

const config = JSON.parse(globalThis.config);

if (config.sentryDSN) {
  Sentry.init({ dsn: config.sentryDSN });
}

const HEART_ICON = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="#FF69B4"
    />
  </svg>
`;

function createReactionElement(icon) {
  const reactionElement = document.createElement("div");
  reactionElement.className = "reaction";
  reactionElement.style.right = `${Math.random() * 0.5 - 0.25}rem`;
  reactionElement.innerHTML = icon;

  return reactionElement;
}

const { supabaseUrl, supabaseAnonKey } = config;
const eventPartial = JSON.parse(globalThis.eventPartial);
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const channelReactions = supabase
  .channel("reactions-inserts")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "reactions",
      filter: `event_id=eq.${eventPartial.id}`,
    },
    () => {
      const reactionElement = createReactionElement(HEART_ICON);
      const parent = document.querySelector(".heart-icon-container");
      parent.appendChild(reactionElement);
    },
  )
  .subscribe();

const channelQuestions = supabase
  .channel("questions-updates")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "questions",
      filter: `event_id=eq.${eventPartial.id}`,
    },
    (_payload) => {
      globalThis.location.reload();
    },
  )
  .subscribe();

const channelVotes = supabase
  .channel("votes-updates")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "votes",
      filter: `question_id=in.(${eventPartial.questionIds})`,
    },
    (_payload) => {
      globalThis.location.reload();
    },
  )
  .on(
    "postgres_changes",
    {
      event: "DELETE",
      schema: "public",
      table: "votes",
      filter: `question_id=in.(${eventPartial.questionIds})`,
    },
    (_payload) => {
      globalThis.location.reload();
    },
  )
  .subscribe();

// Extra safety measure
setTimeout(() => {
  channelReactions.unsubscribe();
  channelQuestions.unsubscribe();
  channelVotes.unsubscribe();
  globalThis.location.reload();
}, 30_000);
