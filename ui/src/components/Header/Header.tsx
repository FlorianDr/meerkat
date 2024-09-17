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
            {event?.speaker ?? "Loading..."}
          </Heading>
          {actionButton}
        </Flex>
      </div>
    </>
  );
}
