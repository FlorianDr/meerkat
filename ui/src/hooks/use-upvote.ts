import useSWRMutation, { TriggerWithoutArgs } from "swr/mutation";
import { HTTPError } from "./http-error.ts";

const upvoter = (url: string) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) {
      throw new HTTPError(res);
    }
    return res.json();
  });

interface UpvoteResponse {
  upvote: TriggerWithoutArgs;
  error: HTTPError | null;
  isUpvoting: boolean;
  upVotesAfterUserVote: number | undefined;
}

interface UpvoteData {
  votes: number;
}

export const useUpvote = (questionId: string | undefined): UpvoteResponse => {
  const { trigger, error, isMutating, data } = useSWRMutation<
    UpvoteData,
    HTTPError
  >(
    questionId ? `/api/v1/questions/${questionId}/upvote` : null,
    upvoter,
  );

  return {
    upvote: trigger,
    error: error ?? null, // Ensure error is HTTPError or null
    isUpvoting: isMutating,
    upVotesAfterUserVote: data?.votes,
  };
};
