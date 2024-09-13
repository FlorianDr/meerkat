import { Event } from "../../hooks/use-event.ts";
import { MemoizedQuestion } from "./Question.tsx";

export function QuestionsSection({ event }: { event: Event | undefined }) {
  return (
    <main className="content">
      <ol>
        {event?.questions.map((question) => {
          return (
            <MemoizedQuestion
              key={question.uid}
              question={question}
            />
          );
        })}
      </ol>
    </main>
  );
}
