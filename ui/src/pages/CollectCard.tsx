import { useEvent } from "../hooks/use-event.ts";
import { Header } from "../components/Header/Header.tsx";
import Card from "../components/Card/Card.tsx";
import { ActionButton } from "../components/Buttons/ActionButton.tsx";

export function CollectCard({ uid }: { uid: string }) {
  const { data: event } = useEvent(uid);

  return (
    <>
      <Header
        event={event}
        actionButton={
          <ActionButton
            text="Kudos"
            onClick={() => console.log("kudos")}
            isDisabled={true}
          />
        }
      />
      <Card event={event} />
    </>
  );
}
