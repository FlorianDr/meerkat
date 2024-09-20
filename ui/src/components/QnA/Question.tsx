import { Heading } from "@chakra-ui/react";
import { UpVoteButton } from "../Buttons/UpVoteButton.tsx";
import { Question as QuestionModel } from "../../hooks/use-event.ts";
import { useUser } from "../../hooks/use-user.ts";
import { useAsyncFormSubmit } from "../../hooks/use-async-form-submit.ts";

interface QuestionProps {
  question: QuestionModel;
  voted: boolean;
}

export function Question({ question, voted }: QuestionProps) {
  const { isAuthenticated } = useUser();
  const { onSubmit } = useAsyncFormSubmit();

  return (
    <li key={`${question.uid}-${question.question}`} className="bubble">
      <Heading as="h3" color="white" size="sm" mb={2}>
        {question.question}
      </Heading>
      <div className="upvote-section">
        {question.user?.name ?? question.user?.uid}
        <div className="upvote">
          <div className={`upvote-count ${voted && "voted"}`}>
            {question.votes}
          </div>
          <form
            method="POST"
            onSubmit={onSubmit}
            action={`/api/v1/questions/${question.uid}/upvote`}
          >
            <UpVoteButton hasVoted={voted} isDisabled={!isAuthenticated} />
          </form>
        </div>
      </div>
    </li>
  );
}
