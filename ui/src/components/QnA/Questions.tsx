import { Heading } from "@chakra-ui/react";
import { Event } from "../../hooks/use-event.ts";
import { UpVoteButton } from "../Buttons/UpVoteButton.tsx";

export function Question({ event }: { event: Event | undefined }) {
  return (
    <main className="content">
      <ol>
        {event?.questions.map((question) => (
          <li key={question.uid} className="bubble">
            <Heading as="h3" color="white" size="sm" mb={2}>
              {question.question}
            </Heading>
            <div>Hello! How can I improve my programming skills?</div>
            <div className="upvote-section">
              <div className="upvote-count">5</div>
              <UpVoteButton />
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
