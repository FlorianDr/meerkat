import { useEvent } from "../hooks/use-event.ts";
import { Header } from "../components/Header/Header.tsx";
import Card from "../components/Card/Card.tsx";

export function CollectCard({ uid }: { uid: string }) {
  const { data: event } = useEvent(uid);

  return (
    <div className="layout">
      <header className="header">
        <Header
          event={event}
          actionButton={null}
        />
      </header>
      <main className="collect-card-content">
        <Card event={event} />
      </main>
    </div>
  );
}
