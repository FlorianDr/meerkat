import { useEvent } from "../hooks/use-event.ts";
import { Question } from "../components/QnA/Questions.tsx";
import { Footer } from "../components/QnA/Footer.tsx";
import { Header } from "../components/Header/Header.tsx";
import { parseUid } from "../route.ts";

export function QnA() {
  const url = new URL(window.location.href);
  const uid = parseUid(url);
  const { data: event } = useEvent(uid);

  return (
    <div className="layout">
      <Header event={event} buttonToRender="collect" />
      <Question event={event} />
      <Footer event={event} />
    </div>
  );
}
