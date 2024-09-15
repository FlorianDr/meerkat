import { useMemo } from "react";
import { type Event } from "../../hooks/use-event.ts";
import { type Vote } from "../../hooks/use-votes.ts";
import { Question } from "./Question.tsx";

export function QuestionsSection(
  { event, votes }: { event: Event | undefined; votes: Vote[] | undefined },
) {
  const questionLookup = useMemo(() => {
    return votes?.reduce((acc, vote) => {
      acc.add(vote.questionUid);
      return acc;
    }, new Set());
  }, [votes, event]);

  return (
    <ol>
      {event?.questions.map((question) => (
        <Question
          key={question.uid}
          question={question}
          voted={questionLookup?.has(question.uid)}
        />
      ))}
    </ol>
  );
}
