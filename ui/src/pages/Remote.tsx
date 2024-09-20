import { Link, useParams } from "react-router-dom";
import { useEvent } from "../hooks/use-event.ts";
import { Header } from "../components/Header/Header.tsx";
import { PrimaryButton } from "../components/Buttons/PrimaryButton.tsx";
import { Button, Flex, Stack } from "@chakra-ui/react";

export function Remote() {
  const { uid } = useParams();
  const { data: event } = useEvent(uid);

  return (
    <div className="layout">
      <header className="header">
        <nav>
          <Flex
            flexDirection="row"
            gap="1"
            alignItems="center"
            padding="0.5rem 0 0 1rem"
            minHeight="32px"
          />
        </nav>
        <Header title={event?.title} subline={event?.speaker} />
      </header>
      <main className="content">
        <Flex justifyContent="center" paddingTop="10">
          <Stack spacing={4}>
            <PrimaryButton as={Link} to={`/events/${uid}/qa`}>
              Join Q&A
            </PrimaryButton>
            <Button
              variant="outline"
              as={Link}
              to={`/events/${uid}/event-card`}
              py={6}
            >
              View Event Info
            </Button>
          </Stack>
        </Flex>
      </main>
    </div>
  );
}
