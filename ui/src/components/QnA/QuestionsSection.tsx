import { useMemo } from "react";
import { type Event } from "../../hooks/use-event.ts";
import { type Vote } from "../../hooks/use-votes.ts";
import { Question } from "./Question.tsx";
import { Flex } from "@chakra-ui/react";
import { type User } from "../../types.ts";

export type QuestionsSectionProps = {
  user: User | undefined;
  event: Event | undefined;
  votes: Vote[] | undefined;
  isAuthenticated: boolean;
  refresh: () => void;
};

export function QuestionsSection(
  { user, event, votes, isAuthenticated, refresh }: QuestionsSectionProps,
) {
  const questionLookup = useMemo(() => {
    return votes?.reduce((acc, vote) => {
      acc.add(vote.questionUid);
      return acc;
    }, new Set());
  }, [votes, event]);

  const hasQuestions = !!event?.questions?.length;

  return (
    <>
      {hasQuestions
        ? (
          <ol className="question-list">
            {event?.questions.map((question) => (
              <Question
                key={question.uid}
                question={question}
                canModerate={user?.role === "organizer"}
                canVote={isAuthenticated}
                refresh={refresh}
                voted={questionLookup?.has(question.uid)}
              />
            ))}
          </ol>
        )
        : (
          <Flex alignItems="center" justifyContent="center" flex="1">
            <span>No questions, yet. Be first to ask!</span>
          </Flex>
        )}
    </>
  );
}
