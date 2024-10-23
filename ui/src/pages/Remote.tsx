import { Button, Grid, Heading, Stack } from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import { PrimaryButton } from "../components/Buttons/PrimaryButton.tsx";
import { useEvent } from "../hooks/use-event.ts";
import { qa } from "../routes.ts";
import { card } from "../routes.ts";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export function Remote() {
  const { uid } = useParams();
  const { data: event } = useEvent(uid);

  return (
    <Stack height="100dvh" justifyContent="center">
      <Grid templateRows="max-content max-content 1fr" gap="2rem">
        <div style={{ margin: "auto" }}>
          {event?.conference.logoUrl
            ? (
              <img
                style={{ maxHeight: 300 }}
                src={event.conference.logoUrl}
                alt={event.conference.name}
              />
            )
            : null}
        </div>
        <Stack spacing={2} flexDirection="column" alignItems="center">
          <Heading as="h1" color="white" size="lg" mb={1.5}>
            {event?.conference.name ?? "Conference"}
          </Heading>
        </Stack>
        <Stack spacing={4} flexDirection="column" alignItems="center">
          <PrimaryButton as={Link} to={qa(uid)}>
            Join Q&A
          </PrimaryButton>
          <Button
            variant="outline"
            as={Link}
            to={card(uid)}
            width="16rem"
            fontWeight="bold"
            py={6}
          >
            Collect
          </Button>
          <Button
            variant="outline"
            as={Link}
            width="16rem"
            fontWeight="bold"
            py={6}
            to={"https://docs.fileverse.io/document/4A8cBKBXTf7zhhUWENxD2t"}
            target="_blank"
            display="flex"
            gap="4px"
          >
            Contribute <ExternalLinkIcon />
          </Button>
        </Stack>
      </Grid>
    </Stack>
  );
}
