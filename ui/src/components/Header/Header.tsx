import { Flex, Heading } from "@chakra-ui/react";
import { Event } from "../../hooks/use-event.ts";
import { KudosButton } from "../Buttons/KudosButton.tsx";
import { CollectButton } from "../Buttons/CollectButton.tsx";

export function Header(
  { event, buttonToRender = "kudos" }: {
    event: Event | undefined;
    buttonToRender?: "kudos" | "collect";
  },
) {
  return (
    <header className="header">
      <div className="title-section">
        <Heading as="h1" color="white" size="md" mb={1.5}>
          {event?.title ?? "Loading..."}
        </Heading>
        <Flex justifyContent="space-between">
          <Heading as="h2" size="md" fontWeight="thin">
            Vitalik Buterin
          </Heading>
          {buttonToRender === "kudos" ? <KudosButton /> : <CollectButton />}
        </Flex>
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
