import { CheckCircleIcon, NotAllowedIcon } from "@chakra-ui/icons";
import {
  Heading,
  Icon,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useToast,
} from "@chakra-ui/react";
import { MdMoreHoriz } from "react-icons/md";
import { useAsyncFormSubmit } from "../../hooks/use-async-form-submit.ts";
import { useBlockUser } from "../../hooks/use-block-user.ts";
import { Question as QuestionModel } from "../../hooks/use-event.ts";
import { useMarkAsAnswered } from "../../hooks/use-mark-as-answered.ts";
import { UpVoteButton } from "../Buttons/UpVoteButton.tsx";
import { Modal } from "../Modal/Modal.tsx";

interface QuestionProps {
  canVote: boolean;
  canModerate: boolean;
  question: QuestionModel;
  voted: boolean;
  refresh: () => void;
}

export function Question(
  { canVote, canModerate, question, voted, refresh }: QuestionProps,
) {
  const toast = useToast();
  const { onSubmit, isOnCooldown } = useAsyncFormSubmit({
    onSuccess: () => {
      refresh();
      toast({
        title: "Vote recorded 🗳️",
        status: "success",
        duration: 1000,
      });
    },
  });
  const { trigger: block } = useBlockUser(question.user?.uid ?? "");
  const { trigger: markAsAnswered } = useMarkAsAnswered(question.uid);

  const handleBlock = async () => {
    await block();
    refresh();
    toast({
      title: "User blocked 🚫",
      status: "success",
      duration: 1000,
    });
  };

  const handleAnswered = async () => {
    await markAsAnswered();
    toast({
      title: "Question marked as answered ✅",
      status: "success",
      duration: 1000,
    });
  };

  const isAnswered = !!question.answeredAt;

  return (
    <>
      <li
        key={`${question.uid}-${question.question}`}
        className={`bubble${isAnswered ? " answered" : ""}`}
      >
        <Heading as="h3" color="white" size="sm" mb={2} flex="1">
          {question.question}
        </Heading>
        {canModerate
          ? (
            <Menu>
              <MenuButton
                as={IconButton}
                size="md"
                aria-label="Options"
                icon={<Icon as={MdMoreHoriz} />}
                variant="ghost"
                justifySelf="flex-end"
              />
              <MenuList>
                <MenuItem onClick={handleAnswered} icon={<CheckCircleIcon />}>
                  Mark as Answered
                </MenuItem>
                <MenuItem onClick={handleBlock} icon={<NotAllowedIcon />}>
                  Block User
                </MenuItem>
              </MenuList>
            </Menu>
          )
          : <div />}
        <span className="author">
          {question.user?.name ?? question.user?.uid}
        </span>
        <div className="upvote">
          <div className={`upvote-count ${voted && "voted"}`}>
            {question.votes}
          </div>
          <form
            method="POST"
            onSubmit={onSubmit}
            action={`/api/v1/questions/${question.uid}/upvote`}
          >
            <UpVoteButton
              hasVoted={voted}
              isDisabled={!canVote || isAnswered}
            />
          </form>
        </div>
      </li>
      {isOnCooldown
        ? (
          <Modal
            isOpen={true}
            onClose={() => {}}
            title="Cooldown"
            lockFocusAcrossFrames
          >
            <p>
              You are on cooldown. Please, try again later.
            </p>
          </Modal>
        )
        : null}
    </>
  );
}
