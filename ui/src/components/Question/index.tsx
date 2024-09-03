import { Heading, IconButton } from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";
import { Event } from "../../hooks/use-event.ts";
import styles from "./styles.module.css";

export function Question({ event }: { event: Event | undefined }) {
  return (
    <main className={styles["content"]}>
      <ol>
        {event?.questions.map((question) => (
          <li key={question.uid} className={styles["bubble"]}>
            <Heading as="h3" color="white" size="sm" mb={2}>
              {question.question}
            </Heading>
            <div>Hello! How can I improve my programming skills?</div>
            <div className={styles["upvote-section"]}>
              <div className={styles["upvote-count"]}>5</div>
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
