import { useEvent } from "../hooks/use-event.ts";
import { Header } from "../components/Header/Header.tsx";
import Card from "../components/Card/Card.tsx";
import { parseUid } from "../route.ts";

export function CollectCard() {
  const url = new URL(window.location.href);
  const uid = parseUid(url);
  const { data: event } = useEvent(uid);

  return (
    <div className="layout">
      <Header event={event} buttonToRender="kudos" />
      <Card event={event} />
    </div>
  );
}
