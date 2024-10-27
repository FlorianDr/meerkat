import { useState } from "react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Flex, Link } from "@chakra-ui/react";
import { Link as ReactRouterLink, useParams } from "react-router-dom";
import { Header } from "../components/Header/Header.tsx";
import { Modal } from "../components/Modal/Modal.tsx";
import { CooldownModal } from "../components/QnA/CooldownModal.tsx";
import { Footer } from "../components/QnA/Footer.tsx";
import { QuestionsSection } from "../components/QnA/QuestionsSection.tsx";
import { useConferenceRoles } from "../hooks/use-conference-roles.ts";
import { useEvent } from "../hooks/use-event.ts";
import { useUser } from "../hooks/use-user.ts";
import { useVotes } from "../hooks/use-votes.ts";
import { remote } from "../routes.ts";
import { useReact } from "../hooks/use-react.ts";
import { Reaction } from "../components/QnA/Reaction.tsx";
import { HeartIcon } from "../components/QnA/HeartIcon.tsx";
import { uuidv7 } from "uuidv7";
import { useReactionsSubscription } from "../hooks/use-reactions-subscription.ts";
import { useQuestionsSubscription } from "../hooks/use-questions-subscription.ts";
import { useQuestions } from "../hooks/use-questions.ts";

export function QnA() {
  const { uid } = useParams();
  const { data: event } = useEvent(uid);
  const { data: questions, mutate: refreshQuestions } = useQuestions(uid);
  const { data: votes, mutate: refreshVotes } = useVotes();
  const { data: roles } = useConferenceRoles();
  const refresh = () => {
    refreshQuestions();
    refreshVotes();
  };

  const { trigger } = useReact(
    event?.uid ?? "",
  );

  const [reactions, setReactions] = useState<{ uid: string }[]>([]);
  const addReaction = (reaction: { uid: string }) => {
    setReactions((prevReactions: { uid: string }[]) => {
      const hasReaction = prevReactions.some((r) => r.uid === reaction.uid);
      return hasReaction ? prevReactions : [...prevReactions, reaction];
    });
  };

  useReactionsSubscription(event, {
    onUpdate: (reaction) => {
      addReaction(reaction);
    },
  });

  useQuestionsSubscription(event, {
    onUpdate: refresh,
  });

  const { data: user, isAuthenticated, isBlocked } = useUser();

  const isOrganizer =
    roles?.some((role) =>
      role.role === "organizer" && role.conferenceId === event?.conferenceId
    ) ?? false;

  const onReactClick = () => {
    const reaction = {
      uid: uuidv7(),
    };
    trigger(reaction);
    addReaction(reaction);
  };

  return (
    <>
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
          <Header title={`QA: ${event?.title}`} subline={event?.speaker} />
        </header>
        <main className="content flex">
          <QuestionsSection
            questions={questions}
            votes={votes}
            isOrganizer={isOrganizer}
            refresh={refresh}
            isAuthenticated={isAuthenticated}
          />
        </main>
        <footer className="footer">
          {reactions.map((reaction: { uid: string }) => (
            <Reaction
              key={reaction.uid}
              uid={reaction.uid}
              icon={<HeartIcon />}
              setReactions={setReactions}
            />
          ))}
          <Footer
            event={event}
            user={user}
            isAuthenticated={isAuthenticated}
            onReactClick={onReactClick}
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
