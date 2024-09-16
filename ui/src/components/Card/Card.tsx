import { Flex, Heading } from "@chakra-ui/react";
import { Event } from "../../hooks/use-event.ts";
import { PrimaryButton } from "../Buttons/PrimaryButton.tsx";

export const Card = ({ event }: { event: Event | undefined }) => {
  return (
    <>
      <div className="collect-card-text">
        <Heading as="h3" color="white" size="sm">
          Collect your event card on Zupass
        </Heading>
      </div>
      <div className="collect-card-image">
        <img
          src="https://cdn.britannica.com/57/152457-050-1128A5FE/Meerkat.jpg"
          alt="Ordinary Card"
        />
      </div>
      <Flex direction="column" align="center">
        <PrimaryButton as="a" href={event?.collectURL} target="_blank">
          Collect
        </PrimaryButton>
      </Flex>
    </>
  );
};

export default Card;
