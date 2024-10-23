import { ArrowBackIcon } from "@chakra-ui/icons";
import { Flex, Link } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { Link as ReactRouterLink, useParams } from "react-router-dom";
import { Header } from "../components/Header/Header.tsx";
import { Modal } from "../components/Modal/Modal.tsx";
import { CooldownModal } from "../components/QnA/CooldownModal.tsx";
import { Footer } from "../components/QnA/Footer.tsx";
import { HeartIcon } from "../components/QnA/HeartIcon.tsx";
import { QuestionsSection } from "../components/QnA/QuestionsSection.tsx";
import { Reaction } from "../components/QnA/Reaction.tsx";
import { useConferenceRoles } from "../hooks/use-conference-roles.ts";
import { useEvent, useEventUpdates } from "../hooks/use-event.ts";
import { useUser } from "../hooks/use-user.ts";
import { useVotes } from "../hooks/use-votes.ts";
import { remote } from "../routes.ts";

export function QnA() {
  const { uid } = useParams();
  const { data: event, mutate: refreshEvent } = useEvent(uid);
  const { data: votes, mutate: refreshVotes } = useVotes();
  const { data: roles } = useConferenceRoles();
  const refresh = () => {
    refreshEvent();
    refreshVotes();
  };

  const { data: user, isAuthenticated, isBlocked } = useUser();
  const [reactions, setReactions] = useState<{ id: number }[]>([]);
  const ref = useRef(0);
  const { data: _update } = useEventUpdates(uid, {
    onUpdate: (message) => {
      const parsedMessage: { [key: string]: string } = JSON.parse(message);
      if (parsedMessage.type === "reaction") {
        setReactions((prevReactions: { id: number }[]) => [
          ...prevReactions,
          { id: ref.current },
        ]);
        ref.current += 1;
      } else {
        refresh();
      }
    },
  });

  const isOrganizer =
    roles?.some((role) =>
      role.role === "organizer" && role.conferenceId === event?.conferenceId
    ) ?? false;

  return (
    <>
      <div className="layout">
        <header className="header">
          <nav>
            <Link as={ReactRouterLink} to={remote(uid)}>
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
          <Header title={`QA: ${event?.title}`} subline={event?.speaker} />
        </header>
        <main className="content flex">
          <QuestionsSection
            event={event}
            votes={votes}
            isOrganizer={isOrganizer}
            refresh={refresh}
            isAuthenticated={isAuthenticated}
          />
        </main>
        <footer className="footer">
          {reactions.map((reaction: { id: number }) => (
            <Reaction
              key={reaction.id}
              id={reaction.id}
              icon={<HeartIcon />}
              setReactions={setReactions}
            />
          ))}
          <Footer
            event={event}
            user={user}
            isAuthenticated={isAuthenticated}
            refresh={refresh}
          />
        </footer>
      </div>
      {isBlocked && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          title="Blocked"
          lockFocusAcrossFrames
        >
          <p>
            You have been blocked from asking questions in this event. If you
            believe this is a mistake, please contact the event organizer.
          </p>
        </Modal>
      )}
      <CooldownModal />
    </>
  );
}
