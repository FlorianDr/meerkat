import {
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { User } from "../../hooks/use-user.ts";
import { Event } from "../../hooks/use-event.ts";
import { useThemeColors } from "../../hooks/use-theme-colors.ts";
import { PrimaryButton } from "../Buttons/PrimaryButton.tsx";
import { HeartIcon } from "./HeartIcon.tsx";

export function Footer({
  event,
  isAuthenticated,
  user,
}: {
  event: Event | undefined;
  isAuthenticated: boolean;
  user: User | undefined;
}) {
  const { primaryPurple } = useThemeColors();

  const action = `/api/v1/events/${event?.uid}/questions`;

  return (
    <div className="overlay-container">
      <form className="target question-input" method="POST" action={action}>
        <Flex gap={4} flexFlow="column" alignItems="center">
          <InputGroup size="lg">
            <Input
              size="lg"
              disabled={!isAuthenticated}
              placeholder={!isAuthenticated
                ? "Please, login before submitting a question!"
                : "Type a question..."}
              name="question"
              bg="#342749"
              color="white"
              borderColor={primaryPurple}
              border="none"
              borderRadius="md"
              p={4}
              _placeholder={{ color: "white" }}
            />
            <InputRightElement width="auto" pr={2}>
              <Flex gap={2}>
                <IconButton
                  isDisabled={!isAuthenticated}
                  type="submit"
                  h="1.75rem"
                  size="sm"
                  colorScheme="purple"
                  icon={<SendIcon />}
                  _hover={isAuthenticated
                    ? {
                      bg: primaryPurple,
                      color: "white",
                      opacity: 0.8,
                    }
                    : {}}
                  aria-label="Submit question"
                />
                <IconButton
                  isDisabled={!isAuthenticated}
                  onClick={(e) => {
                    e.preventDefault();
                    if (isAuthenticated && event?.uid) {
                      fetch(`/api/v1/events/${event.uid}/react`, {
                        method: "POST",
                      });
                    }
                  }}
                  h="1.75rem"
                  size="sm"
                  colorScheme="purple"
                  icon={<HeartIcon />}
                  _hover={isAuthenticated
                    ? {
                      bg: primaryPurple,
                      color: "white",
                      opacity: 0.8,
                    }
                    : {}}
                  aria-label="React to event"
                />
              </Flex>
            </InputRightElement>
          </InputGroup>
        </Flex>
        <span className="signin-name">
          Signed as {user?.name ?? user?.uid ?? "Anonymous"}
        </span>
      </form>
      {!isAuthenticated && <LoginOverlay event={event}></LoginOverlay>}
    </div>
  );
}

function LoginOverlay({ event }: { event?: Event }) {
  return (
    <div className="overlay login">
      <span>To participate:</span>
      <PrimaryButton as="a" href={event?.proofURL}>
        Login with Zupass <ExternalLinkIcon />
      </PrimaryButton>
    </div>
  );
}

function SendIcon() {
  return (
    <Icon viewBox="0 0 24 24">
      <path fill="white" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </Icon>
  );
}
