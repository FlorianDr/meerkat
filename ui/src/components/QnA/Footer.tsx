import { Button, Flex, Input, Link } from "@chakra-ui/react";
import { useUser } from "../../hooks/use-user.ts";
import { Event } from "../../hooks/use-event.ts";
import styles from "./styles.module.css";

export function Footer({ event }: { event: Event | undefined }) {
  const { data: user, isLoading: isLoadingUser } = useUser();
  const isAuthenticated = !isLoadingUser && !!user;

  return (
    <footer className={styles["footer"]}>
      <form method="POST" action={`/api/v1/events/${event?.uid}/questions`}>
        <Flex gap={4}>
          <Input
            disabled={!isAuthenticated}
            placeholder={
              !isAuthenticated
                ? "Please, login before submitting a question!"
                : "Type a question..."
            }
            name="question"
            bg="#191919"
            color="white"
            border="none"
            borderRadius="md"
            p={4}
            _placeholder={{ color: "white" }}
          />
          {/* TODO: Replace whit a when design finalized */}
          <Button type="submit" variant="solid" colorScheme="teal">
            Send
          </Button>
        </Flex>
      </form>
      {isAuthenticated ? (
        <>Signed with uid {user?.uid}</>
      ) : (
        <Link href={event?.proofURL}>Login</Link>
      )}
    </footer>
  );
}
