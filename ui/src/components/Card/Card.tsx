import { Box, Flex, Heading, Link } from "@chakra-ui/react";
import { Event } from "../../hooks/use-event.ts";
import { PrimaryButton } from "../Buttons/PrimaryButton.tsx";

export const Card = ({ event }: { event: Event | undefined }) => {
  return (
    <div className="card">
      <div className="collect-card-text">
        <Heading as="h3" color="white" size="sm">
          Event
        </Heading>
      </div>
      <div className="collect-card-image">
        <img
          src={event?.cover ??
            "https://cdn.britannica.com/57/152457-050-1128A5FE/Meerkat.jpg"}
          alt="Ordinary Card"
        />
      </div>
      <Flex direction="column" align="center">
        <PrimaryButton as="a" href={event?.collectURL} target="_blank">
          Collect
        </PrimaryButton>
      </Flex>
      <Box m="19px">
        <p>
          Taking notes? Contribute to collective notes on{" "}
          <Link
            href="https://docs.fileverse.io/document/4A8cBKBXTf7zhhUWENxD2t"
            target="_blank"
          >
            Fileverse.
          </Link>
        </p>
      </Box>
    </div>
  );
};

export default Card;
