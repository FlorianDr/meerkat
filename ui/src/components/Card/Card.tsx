import { Flex } from "@chakra-ui/react";
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
  return (
    <div className="card">
      <div className="collect-card-image">
        <img
          src={event?.cover ??
            "https://cdn.britannica.com/57/152457-050-1128A5FE/Meerkat.jpg"}
          alt="Ordinary Card"
        />
      </div>
      <Flex direction="column" align="center">
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
          : (
            <p>
              Find the secret QR in the venue to collect this card.
            </p>
          )}
      </Flex>
    </div>
  );
};

export default Card;
