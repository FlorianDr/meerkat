import { Heading } from "@chakra-ui/react";
import { useEvent } from "../../hooks/use-event.ts";
import { parseUid } from "../../route.ts";
import { Question } from "../Question/index.tsx";
import styles from "./styles.module.css";

export function TopQuestions() {
  const url = new URL(window.location.href);
  const uid = parseUid(url);
  const { data: event } = useEvent(uid);

  return (
    // TODO: move inline styles to css once design finalized
    <div
      className="layout"
      style={{
        background:
          "linear-gradient(218.34deg, rgba(175, 177, 245, 0.86) 22.08%, #854FE3 90.71%)",
      }}
    >
      <header className={styles["header"]}>
        <Heading as="h1" color="white" size="md" mb={1.5}>
          Top Questions{" "}
          <span className={styles["question-count"]}>
            ({event?.questions.length ?? "Loading..."})
          </span>
        </Heading>
      </header>
      <Question event={event} />
      <footer className={styles["footer"]}>
        <Heading as="h1" color="white" size="md" mb={1.5}>
          Attendees <span className={styles["question-count"]}>(121)</span>
        </Heading>
        <Heading as="h1" color="white" size="md" mb={1.5}>
          Votes <span className={styles["question-count"]}>(53)</span>
        </Heading>
      </footer>
    </div>
  );
}
