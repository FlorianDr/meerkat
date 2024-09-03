import { useEvent } from "../../hooks/use-event.ts";
import { parseUid } from "../../route.ts";
import { Footer } from "./Footer.tsx";
import { Header } from "./Header.tsx";
import { Main } from "./Main.tsx";

export function QnA() {
  const url = new URL(window.location.href);
  const uid = parseUid(url);
  const { data: event } = useEvent(uid);

  return (
    <div className="layout">
      <Header event={event} />
      <Main event={event} />
      <Footer event={event} />
    </div>
  );
}
