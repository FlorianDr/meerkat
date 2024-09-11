import { Event } from "../../hooks/use-event.ts";
import { Question } from "./Question.tsx";

export function QuestionsSection({ event }: { event: Event | undefined }) {
  return (
    <main className="content">
      <ol>
        {event?.questions.map((question) => {
          return <Question question={question} />;
        })}
      </ol>
    </main>
  );
}
