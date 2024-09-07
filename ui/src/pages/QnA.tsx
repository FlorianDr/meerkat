import { useEvent } from "../hooks/use-event.ts";
import { parseUid } from "../route.ts";
import { Question } from "../components/QnA/Questions.tsx";
import { Footer } from "../components/QnA/Footer.tsx";
import { Header } from "../components/QnA/Header.tsx";

export function QnA() {
  const url = new URL(window.location.href);
  const uid = parseUid(url);
  const { data: event } = useEvent(uid);

  return (
    <div className="layout">
      <Header event={event} />
      <Question event={event} />
      <Footer event={event} />
    </div>
  );
}
