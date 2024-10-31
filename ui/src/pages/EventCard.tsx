import { Link, useParams, useSearchParams } from "react-router-dom";
import Card from "../components/Card/Card.tsx";
import { useEvent } from "../hooks/use-event.ts";
import { Header } from "../components/Header/Header.tsx";
import { remote } from "../routes.ts";
import { Link as ReactRouterLink } from "react-router-dom";
import { Flex } from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";

export function EventCard() {
  const { uid } = useParams();
  const [searchParams] = useSearchParams();
  const { data: event } = useEvent(uid);
  const secret = searchParams.get("secret");

  const hasTempleBackground = event?.features["temple-background"] ?? false;

  return (
    <div className="layout">
      <header className="header">
        <nav>
          <Link as={ReactRouterLink} to={uid ? remote(uid) : ""}>
            <Flex
              flexDirection="row"
              gap="1"
              alignItems="center"
              padding="0.5rem 0 0 1rem"
              minHeight="1rem"
            >
              <ArrowBackIcon /> <span>Controls</span>
            </Flex>
          </Link>
        </nav>
        <div style={{ paddingBottom: "1rem" }}>
          <Header title={`Card: ${event?.title}`} />
        </div>
      </header>
      <main
        className={`content ${hasTempleBackground ? "temple-background" : ""}`}
      >
        <Card event={event} canCollect={!!secret} />
      </main>
    </div>
  );
}
