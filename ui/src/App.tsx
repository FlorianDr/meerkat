import { Button, Flex, Heading, Input, Link } from "@chakra-ui/react";
import { parseUid } from "./route.ts";
import { useUser } from "./hooks/use-user.ts";
import { useEvent } from "./hooks/use-event.ts";
import "./index.css";

function App() {
  const url = new URL(window.location.href);
  const uid = parseUid(url);

  const { data: user, isLoading: isLoadingUser } = useUser();
  const { data: event } = useEvent(uid);

  const isAuthenticated = !isLoadingUser && !!user;

  return (
    <>
      <div className="layout">
        <header className="header">
          <Heading as="h1">{event?.title}</Heading>
        </header>
        <main className="content">
          <ol>
            {event?.questions.map((question) => (
              <li key={question.id} className="bubble">
                {question.question}
              </li>
            ))}
          </ol>
        </main>
        <footer className="footer">
          {isAuthenticated
            ? (
              <form
                method="POST"
                action={`/api/v1/events/${event?.uid}/questions`}
              >
                <Flex gap={4}>
                  <Input name="question" placeholder="Type a question..." />
                  <Button type="submit" variant="solid" colorScheme="teal">
                    Send
                  </Button>
                </Flex>
              </form>
            )
            : <Link href={event?.proofURL}>Login</Link>}
          {isAuthenticated ? <>Signed with uid {user?.uid}</> : null}
        </footer>
      </div>
    </>
  );
}

export default App;
