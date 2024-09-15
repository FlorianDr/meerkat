import { Heading } from "@chakra-ui/react";
import { UpVoteButton } from "../Buttons/UpVoteButton.tsx";
import { QuestionWithVotes } from "../../hooks/use-event.ts";
import { useUser } from "../../hooks/use-user.ts";

interface QuestionProps {
  question: QuestionWithVotes;
}

export function Question(
  { question }: QuestionProps,
) {
  const { isAuthenticated } = useUser();
  return (
    <li key={`${question.uid}-${question.question}`} className="bubble">
      <Heading as="h3" color="white" size="sm" mb={2}>
        {question.question}
      </Heading>
      <div className="upvote-section">
        <div className={`upvote-count ${question.hasVoted && "voted"}`}>
          {question.votes}
        </div>
        <form method="POST" action={`/api/v1/questions/${question.uid}/upvote`}>
          <UpVoteButton
            hasVoted={question.hasVoted}
            isDisabled={!isAuthenticated}
          />
        </form>
      </div>
    </li>
  );
}
