import { Heading } from "@chakra-ui/react";
import { Event } from "../../hooks/use-event.ts";
import "./index.css";

export function Header({ event }: { event: Event | undefined }) {
  return (
    <header className="header">
      <div className="title-section">
        <Heading as="h1" color="white" size="md" mb={1.5}>
          {event?.title}
        </Heading>
        <Heading as="h2" size="md" fontWeight="thin">
          Vitalik Buterin
        </Heading>
      </div>
      <div className="stats-section">
        <div className="stat-box">
          <div className="stat-value">{event?.questions.length ?? 0}</div>
          <div className="stat-label">Questions</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">121</div>
          <div className="stat-label">Participants</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">32</div>
          <div className="stat-label">Up-votes</div>
        </div>
      </div>
    </header>
  );
}
