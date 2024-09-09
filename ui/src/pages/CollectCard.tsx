import { useEvent } from "../hooks/use-event.ts";
import { Header } from "../components/Header/Header.tsx";
import Card from "../components/Card/Card.tsx";

export function CollectCard({ uid }: { uid: string }) {
  const { data: event } = useEvent(uid);

  return (
    <div className="layout">
      <Header event={event} buttonToRender="kudos" />
      <Card event={event} />
    </div>
  );
}
