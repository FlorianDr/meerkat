import { useMemo } from "react";
import { type Event } from "../../hooks/use-event.ts";
import { type Vote } from "../../hooks/use-votes.ts";
import { Question } from "./Question.tsx";

export type QuestionsSectionProps = {
  event: Event | undefined;
  votes: Vote[] | undefined;
  isAuthenticated: boolean;
  refresh: () => void;
};

export function QuestionsSection(
  { event, votes, isAuthenticated, refresh }: QuestionsSectionProps,
) {
  const questionLookup = useMemo(() => {
    return votes?.reduce((acc, vote) => {
      acc.add(vote.questionUid);
      return acc;
    }, new Set());
  }, [votes, event]);

  return (
    <ol className="question-list">
      {event?.questions.map((question) => (
        <Question
          key={question.uid}
          question={question}
          isAuthenticated={isAuthenticated}
          refresh={refresh}
          voted={questionLookup?.has(question.uid)}
        />
      ))}
    </ol>
  );
}
