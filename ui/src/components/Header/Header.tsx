import { Flex, Heading } from "@chakra-ui/react";
import { Event } from "../../hooks/use-event.ts";

interface HeaderProps {
  event: Event | undefined;
  actionButton: React.ReactNode;
}

export function Header({ event, actionButton }: HeaderProps) {
  return (
    <>
      <div className="title-section">
        <Heading as="h1" color="white" size="md" mb={1.5}>
          {event?.title ?? "Loading..."}
        </Heading>
        <Flex justifyContent="space-between">
          <Heading as="h2" size="md" fontWeight="thin">
            Vitalik Buterin
          </Heading>
          {actionButton}
        </Flex>
      </div>
      <div className="stats-section">
        <div className="stat-box">
          <div className="stat-value">{event?.questions.length ?? 0}</div>
          <div className="stat-label">Questions</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{event?.participants}</div>
          <div className="stat-label">Participants</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{event?.votes}</div>
          <div className="stat-label">Votes</div>
        </div>
      </div>
    </>
  );
}
