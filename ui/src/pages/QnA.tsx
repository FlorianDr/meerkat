import { useEvent } from "../hooks/use-event.ts";
import { QuestionsSection } from "../components/QnA/QuestionsSection.tsx";
import { Footer } from "../components/QnA/Footer.tsx";
import { Header } from "../components/Header/Header.tsx";
import { ActionButton } from "../components/Buttons/ActionButton.tsx";
import { useNavigateCallback } from "../hooks/use-navigate-callback.ts";

export function QnA({ uid }: { uid: string }) {
  const { data: event } = useEvent(uid);
  const navigate = useNavigateCallback(`/events/${event?.uid}/collect`);

  return (
    <>
      <Header
        event={event}
        actionButton={
          <ActionButton
            text="Collect"
            onClick={navigate}
            isDisabled={!event?.uid}
          />
        }
      />
      <QuestionsSection event={event} />
      <Footer event={event} />
    </>
  );
}
