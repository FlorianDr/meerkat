import { Button, Flex, Heading, Stack } from "@chakra-ui/react";
import { Link, useParams } from "react-router-dom";
import { PrimaryButton } from "../components/Buttons/PrimaryButton.tsx";
import { useEvent } from "../hooks/use-event.ts";
import { qa } from "../routes.ts";
import { card } from "../routes.ts";
import { ExternalLinkIcon } from "@chakra-ui/icons";

export function Remote() {
  const { uid } = useParams();
  const { data: event } = useEvent(uid);

  const hasFileverseLink = event?.features["fileverse-link"] ?? false;

  return (
    <div className="layout">
      <main
        className="content"
        style={{
          marginTop: "8dvh",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        {event?.conference.logoUrl
          ? (
            <img
              style={{ maxHeight: 300, margin: "0 auto" }}
              src={event.conference.logoUrl}
              alt={event.conference.name}
            />
          )
          : null}
        <Stack spacing={2} flexDirection="column" alignItems="center">
          <Heading as="h1" color="white" size="lg" mb={1.5}>
            {event?.title ?? ""}
          </Heading>
          <Flex justifyContent="space-between">
            <Heading
              as="h2"
              size="md"
              fontWeight="thin"
              wordBreak="break-word"
              color="white"
            >
              {event?.speaker ?? ""}
            </Heading>
          </Flex>
        </Stack>
        <Stack spacing={4} flexDirection="column" alignItems="center">
          <PrimaryButton as={Link} to={uid ? qa(uid) : ""}>
            Join Q&A
          </PrimaryButton>
          <Button
            variant="outline"
            as={Link}
            to={uid ? card(uid) : ""}
            width="16rem"
            fontWeight="bold"
            py={6}
          >
            Collect
          </Button>
          {hasFileverseLink && event?.uid &&
            (
              <Link
                to={`https://devcon.fileverse.io/devcon7/space?event=${event.uid}`}
                target="_blank"
              >
                Contribute on Fileverse <ExternalLinkIcon />
              </Link>
            )}
        </Stack>
      </main>
    </div>
  );
}
