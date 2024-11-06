import { useState } from "react";
import { Flex, Heading, Skeleton } from "@chakra-ui/react";
import { Event } from "../../types.ts";
import { PrimaryButton } from "../Buttons/PrimaryButton.tsx";

export type CardProps = {
  event: Event | undefined;
  canCollect?: boolean;
  collect?: () => Promise<void>;
  isCollecting?: boolean;
};

export const Card = (
  { event, canCollect = false, collect, isCollecting }: CardProps,
) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="card">
      <div className="collect-card-image">
        <Skeleton isLoaded={!isLoading} width={300} height={300}>
          {event?.cover
            ? (
              <img
                src={event?.cover}
                alt="Ordinary Card"
                style={{ height: 300, margin: "0 auto" }}
                onLoad={() => setIsLoading(false)}
              />
            )
            : null}
        </Skeleton>
      </div>
      <Flex direction="column" align="center" gap={4}>
        <Skeleton isLoaded={!!event} width="fit-content">
          <Heading as="h1" color="white" size="lg" mb={1.5}>
            {event?.title ?? "Loading... please stand by"}
          </Heading>
        </Skeleton>
        <Flex justifyContent="space-between">
          <Skeleton isLoaded={!!event} width="fit-content">
            <Heading
              as="h2"
              size="md"
              fontWeight="thin"
              wordBreak="break-word"
              color="white"
            >
              {event?.speaker ?? "Loading..."}
            </Heading>
          </Skeleton>
        </Flex>

        {canCollect
          ? (
            <PrimaryButton
              isLoading={isCollecting}
              loadingText="Collecting..."
              onClick={collect}
              disabled={!canCollect}
            >
              Collect
            </PrimaryButton>
          )
          : null}
      </Flex>
    </div>
  );
};

export default Card;
