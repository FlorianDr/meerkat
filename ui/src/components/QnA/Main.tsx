import { Heading, IconButton } from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { Event } from "../../hooks/use-event.ts";
import "./index.css";

export function Main({ event }: { event: Event | undefined }) {
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
              <IconButton
                ml={1}
                icon={<ArrowUpIcon />}
                aria-label="Upvote"
                variant="ghost"
                colorScheme="whiteAlpha"
                fontSize="1.5rem"
                top="0.1rem"
                _hover={{ bg: "none" }}
              />
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
