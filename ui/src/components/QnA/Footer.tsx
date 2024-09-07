import {
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { Icon } from "@chakra-ui/icons";
import { useUser } from "../../hooks/use-user.ts";
import { Event } from "../../hooks/use-event.ts";
import { Login } from "./Login.tsx";

export function Footer({ event }: { event: Event | undefined }) {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const isAuthenticated = !isLoadingUser && !!user;

  return (
    <footer className="footer" style={{ position: "relative" }}>
      <form method="POST" action={`/api/v1/events/${event?.uid}/questions`}>
        <Flex gap={4}>
          <InputGroup size="md">
            <Input
              disabled={isAuthenticated}
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
                bg="rgba(136, 116, 170, 1)"
                icon={
                  <Icon viewBox="0 0 24 24">
                    <path
                      fill="white"
                      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                    />
                  </Icon>
                }
                _hover={{
                  bg: "rgba(136, 116, 170, 1)",
                  color: "white",
                  opacity: 0.8,
                }}
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
