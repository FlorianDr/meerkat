import { Button, Grid, Heading, Stack } from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import { eth_berlin_logo } from "../assets/ethereum_berlin.ts";
import { PrimaryButton } from "../components/Buttons/PrimaryButton.tsx";

export function Remote() {
  const { uid } = useParams();

  return (
    <Stack height="100dvh" justifyContent="center">
      <Grid templateRows="max-content 150px max-content" gap="2rem">
        <div style={{ margin: "auto" }}>
          <div
            dangerouslySetInnerHTML={{ __html: eth_berlin_logo }}
          />
        </div>
        <Stack spacing={2} flexDirection="column" alignItems="center">
          <Heading as="h1" color="white" size="lg" mb={1.5}>
            Ethereum meetup Berlin
          </Heading>
          <Heading as="h2" size="md" fontWeight="thin">
            Meerkat Team
          </Heading>
        </Stack>
        <Stack spacing={4} flexDirection="column" alignItems="center">
          <PrimaryButton as={Link} to={`/events/${uid}/qa`}>
            Join Q&A
          </PrimaryButton>
          <Button
            variant="outline"
            as={Link}
            to={`/events/${uid}/event-card`}
            width="16rem"
            fontWeight="bold"
            py={6}
          >
            Collect
          </Button>
        </Stack>
      </Grid>
    </Stack>
  );
}
