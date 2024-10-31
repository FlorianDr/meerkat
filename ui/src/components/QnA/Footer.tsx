import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Flex, Icon, IconButton, Textarea, useToast } from "@chakra-ui/react";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useLogin } from "../../hooks/use-login.ts";
import { useThemeColors } from "../../hooks/use-theme-colors.ts";
import { User } from "../../types.ts";
import { PrimaryButton } from "../Buttons/PrimaryButton.tsx";
import { HeartIcon } from "./HeartIcon.tsx";
import { Event } from "../../types.ts";
import { useState } from "react";
import { useAskQuestion } from "../../hooks/use-ask-question.ts";

const MAX_QUESTION_LENGTH = 200;

export type FooterProps = {
  event: Event | undefined;
  isAuthenticated: boolean;
  isUserLoading: boolean;
  user: User | undefined;
  refresh: () => void;
  onReactClick: () => void;
};

export function Footer({
  event,
  isAuthenticated,
  isUserLoading,
  user,
  refresh,
  onReactClick,
}: FooterProps) {
  const { primaryPurple } = useThemeColors();
  const [focused, setFocused] = useState(false);
  const { login, isLoading } = useLogin();
  const toast = useToast();
  const [question, setQuestion] = useState("");
  const [isTutorialHeartFinished, setIsTutorialHeartFinished] = useLocalStorage(
    "tutorial-heart",
    false,
  );
  const { trigger } = useAskQuestion(event, {
    onSuccess: () => {
      toast({
        title: "Question added 🎉",
        status: "success",
        duration: 2000,
      });
      refresh();
      setQuestion("");
    },
  });

  const submitQuestion = () => {
    if (question) {
      trigger({
        question,
      });
    }
  };

  const isQuestionMode = focused || question;

  return (
    <>
      <div className="overlay-container">
        <div className="target question-input">
          <Flex gap={2} flexFlow="row" alignItems="flex-start">
            <Textarea
              resize="vertical"
              size="lg"
              minH="48px"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitQuestion();
                }
              }}
              disabled={!isAuthenticated}
              placeholder="Type a question..."
              name="question"
              bg="#342749"
              color="white"
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rows={isQuestionMode ? 3 : 1}
              borderColor={primaryPurple}
              border="none"
              borderRadius="md"
              paddingTop="12px"
              maxLength={MAX_QUESTION_LENGTH}
            />
            <IconButton
              isDisabled={!isAuthenticated}
              size="lg"
              onClick={submitQuestion}
              bg="purple.500"
              _hover={{ bg: "purple.600" }}
              icon={<SendIcon />}
              aria-label="Submit question"
            />
            {!isQuestionMode
              ? (
                <IconButton
                  isDisabled={!isAuthenticated}
                  onClick={() => {
                    onReactClick();
                    setIsTutorialHeartFinished(true);
                  }}
                  variant="ghost"
                  size="lg"
                  icon={
                    <div
                      className={!isTutorialHeartFinished
                        ? "pulsate"
                        : undefined}
                    >
                      <HeartIcon />
                    </div>
                  }
                  borderColor="purple.500"
                  aria-label="React to event"
                  type="button"
                />
              )
              : null}
          </Flex>
          <span className="signin-name">
            Signed as {user?.name ?? user?.uid ?? "Anonymous"}
          </span>
        </div>
        {!isAuthenticated && !isUserLoading && (
          <LoginOverlay>
            <PrimaryButton
              isLoading={isLoading}
              loadingText="Connecting..."
              onClick={() => login()}
            >
              Login with Zupass <ExternalLinkIcon />
            </PrimaryButton>
          </LoginOverlay>
        )}
      </div>
    </>
  );
}

function LoginOverlay(
  { children }: { children?: React.ReactNode },
) {
  return (
    <div className="overlay login">
      <span>To participate:</span>
      {children}
    </div>
  );
}

function SendIcon() {
  return (
    <Icon viewBox="0 0 24 24">
      <path fill="white" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </Icon>
  );
}
