import {
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { useUser } from "../../hooks/use-user.ts";
import { Event } from "../../hooks/use-event.ts";
import { Login } from "./Login.tsx";
import { useThemeColors } from "../../hooks/use-theme-colors.ts";

export function Footer({ event }: { event: Event | undefined }) {
  const { data: user, isAuthenticated } = useUser();
  const { primaryPurple } = useThemeColors();

  return (
    <footer className="footer" style={{ position: "relative" }}>
      <form method="POST" action={`/api/v1/events/${event?.uid}/questions`}>
        <Flex gap={4} flexFlow="column" alignItems="center">
          <InputGroup size="md">
            <Input
              disabled={!isAuthenticated}
              placeholder={!isAuthenticated
                ? "Please, login before submitting a question!"
                : "Type a question..."}
              name="question"
              bg="#191919"
              color="white"
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
                bg={primaryPurple}
                icon={
                  <Icon viewBox="0 0 24 24">
                    <path
                      fill="white"
                      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                    />
                  </Icon>
                }
                _hover={isAuthenticated
                  ? {
                    bg: primaryPurple,
                    color: "white",
                    opacity: 0.8,
                  }
                  : {}}
                aria-label="Send question"
                colorScheme="purple"
                variant="ghost"
              />
            </InputRightElement>
          </InputGroup>
          <Login {...{ user, isAuthenticated, event }} />
        </Flex>
      </form>
    </footer>
  );
}
