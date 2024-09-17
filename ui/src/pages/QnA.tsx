import { useEvent, useEventUpdates } from "../hooks/use-event.ts";
import { QuestionsSection } from "../components/QnA/QuestionsSection.tsx";
import { Footer } from "../components/QnA/Footer.tsx";
import { Header } from "../components/Header/Header.tsx";
import { ActionButton } from "../components/Buttons/ActionButton.tsx";
import { useNavigate } from "../hooks/use-routes.tsx";
import { useVotes } from "../hooks/use-votes.ts";

export function QnA({ uid }: { uid: string }) {
  const { data: event, mutate } = useEvent(uid);
  const { data: _update } = useEventUpdates(uid, {
    onUpdate: () => {
      mutate();
    },
  });
  const { data: votes } = useVotes();
  const navigate = useNavigate(`/events/${event?.uid}/collect`);

  return (
    <div className="layout">
      <header className="header">
        <Header
          event={event}
          actionButton={
            <ActionButton
              text="View"
              onClick={navigate}
              isDisabled={!event?.uid}
            />
          }
        />
      </header>
      <main className="content">
        <QuestionsSection event={event} votes={votes} />
      </main>
      <footer className="footer">
        <Footer event={event} />
      </footer>
    </div>
  );
}
