import { Heading } from "@chakra-ui/react";
import { MemoizedUpVoteButton } from "../Buttons/UpVoteButton.tsx";
import { useCallback, useEffect, useState } from "react";
import { Question as QuestionType } from "../../hooks/use-event.ts";
import { useUpvote } from "../../hooks/use-upvote.ts";

export function Question(
  { question }: { question: QuestionType },
) {
  const { upvote, error, upVotesAfterUserVote } = useUpvote(question.uid);
  const [upvotes, setUpvotes] = useState(question.upVotes ?? 0);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (error?.status === 500) {
      setHasVoted(false);
      return;
    }

    const isAfterUserVote = typeof upVotesAfterUserVote === "number" &&
      upVotesAfterUserVote > question.upVotes;

    const newUpvotes = isAfterUserVote
      ? upVotesAfterUserVote
      : question.upVotes;

    setUpvotes(newUpvotes);
  }, [question.upVotes, error, upVotesAfterUserVote]);

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
        <div className="upvote-count">{upvotes}</div>
        <MemoizedUpVoteButton onClick={handleUpvote} />
      </div>
    </li>
  );
}
