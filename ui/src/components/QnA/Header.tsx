import { Heading } from "@chakra-ui/react";
import { Event } from "../../hooks/use-event.ts";
import styles from "./styles.module.css";

export function Header({ event }: { event: Event | undefined }) {
  return (
    <header className={styles["header"]}>
      <div className={styles["title-section"]}>
        <Heading as="h1" color="white" size="md" mb={1.5}>
          {event?.title}
        </Heading>
        <Heading as="h2" size="md" fontWeight="thin">
          Vitalik Buterin
        </Heading>
      </div>
      <div className={styles["stats-section"]}>
        <div className={styles["stat-box"]}>
          <div className={styles["stat-value"]}>
            {event?.questions.length ?? 0}
          </div>
          <div className={styles["stat-label"]}>Questions</div>
        </div>
        <div className={styles["stat-box"]}>
          <div className={styles["stat-value"]}>121</div>
          <div className={styles["stat-label"]}>Participants</div>
        </div>
        <div className={styles["stat-box"]}>
          <div className={styles["stat-value"]}>32</div>
          <div className={styles["stat-label"]}>Up-votes</div>
        </div>
      </div>
    </header>
  );
}
