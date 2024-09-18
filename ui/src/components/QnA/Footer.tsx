import {
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useUser } from "../../hooks/use-user.ts";
import { Event } from "../../hooks/use-event.ts";
import { useThemeColors } from "../../hooks/use-theme-colors.ts";
import { PrimaryButton } from "../Buttons/PrimaryButton.tsx";

export function Footer({ event }: { event: Event | undefined }) {
  const { data: user, isAuthenticated } = useUser();
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
            <InputRightElement>
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
      <span>
        To participate:
      </span>
      <PrimaryButton
        as="a"
        href={event?.proofURL}
      >
        Login with Zupass <ExternalLinkIcon />
      </PrimaryButton>
    </div>
  );
}

function SendIcon() {
  return (
    <Icon viewBox="0 0 24 24">
      <path
        fill="white"
        d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
      />
    </Icon>
  );
}
