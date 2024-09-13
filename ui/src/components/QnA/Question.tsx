import { Heading } from "@chakra-ui/react";
import { UpVoteButton } from "../Buttons/UpVoteButton.tsx";
import { useCallback, useEffect, useState } from "react";
import { QuestionWithVotes } from "../../hooks/use-event.ts";
import { useUpvote } from "../../hooks/use-upvote.ts";
import { memo } from "react";

interface QuestionProps {
  question: QuestionWithVotes;
}

export function Question(
  { question }: QuestionProps,
) {
  const { upvote, error, upVotesAfterUserVote } = useUpvote(question.uid);
  const [votes, setVotes] = useState(question.votes ?? 0);
  const [hasVoted, setHasVoted] = useState<boolean>(question.hasVoted);

  useEffect(() => {
    if (error?.status === 500) {
      setHasVoted(false);
      return;
    }

    const isAfterUserVote = typeof upVotesAfterUserVote === "number" &&
      upVotesAfterUserVote > question.votes;

    const newUpvotes = isAfterUserVote ? upVotesAfterUserVote : question.votes;

    setVotes(newUpvotes);
  }, [question.votes, error, upVotesAfterUserVote]);

  const handleUpvote = useCallback(() => {
    if (hasVoted) return;
    upvote();
    setHasVoted(true);
  }, [hasVoted, upvote]);

  return (
    <li key={`${question.uid}-${question.question}`} className="bubble">
      <Heading as="h3" color="white" size="sm" mb={2}>
        {question.question}
      </Heading>
      <div className="upvote-section">
        <div className="upvote-count">{votes}</div>
        <UpVoteButton onClick={handleUpvote} hasVoted={hasVoted} />
      </div>
    </li>
  );
}

const areEqual = (
  prevProps: { question: QuestionWithVotes },
  nextProps: { question: QuestionWithVotes },
) => {
  return (
    prevProps.question.uid === nextProps.question.uid &&
    prevProps.question.votes === nextProps.question.votes &&
    prevProps.question.hasVoted === nextProps.question.hasVoted
  );
};

export const MemoizedQuestion = memo<QuestionProps>(Question, areEqual);
