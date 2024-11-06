import { useState } from "react";
import { Flex, Heading, Skeleton } from "@chakra-ui/react";
import { Event } from "../../types.ts";

export type CardProps = {
  event: Event | undefined;
};

export const Card = (
  { event }: CardProps,
) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
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
      <Flex direction="column" align="center" gap="12px">
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
      </Flex>
    </>
  );
};

export default Card;
