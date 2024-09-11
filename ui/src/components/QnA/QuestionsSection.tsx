import { Event } from "../../hooks/use-event.ts";
import { Question } from "./Question.tsx";

export function QuestionsSection({ event }: { event: Event | undefined }) {
  return (
    <main className="content">
      <ol>
        {event?.questions.map((question) => (
          <Question key={question.uid} question={question} />
        ))}
      </ol>
    </main>
  );
}
