import { useEvent } from "../hooks/use-event.ts";
import { Question } from "../components/QnA/Questions.tsx";
import { Footer } from "../components/QnA/Footer.tsx";
import { Header } from "../components/Header/Header.tsx";

export function QnA({ uid }: { uid: string }) {
  const { data: event } = useEvent(uid);

  return (
    <div className="layout">
      <Header event={event} buttonToRender="collect" />
      <Question event={event} />
      <Footer event={event} />
    </div>
  );
}
