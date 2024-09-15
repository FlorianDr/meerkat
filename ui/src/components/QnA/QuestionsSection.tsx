import { Event } from "../../hooks/use-event.ts";
import { MemoizedQuestion } from "./Question.tsx";

export function QuestionsSection({ event }: { event: Event | undefined }) {
  return (
    <ol>
      {event?.questions.map((question) => (
        <MemoizedQuestion key={question.uid} question={question} />
      ))}
    </ol>
  );
}
