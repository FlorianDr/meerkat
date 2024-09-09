import { Button, Flex, Heading } from "@chakra-ui/react";
import { Event } from "../../hooks/use-event.ts";
import { useUser } from "../../hooks/use-user.ts";

export const Card = ({ event }: { event: Event | undefined }) => {
  const { data: user, isAuthenticated } = useUser();

  const hasUserAskedQuestion = event?.questions.some((question) =>
    (question.userId) === Number(user?.uid)
  );

  return (
    <main className="collect-card-content">
      <div className="collect-card-text">
        <Heading as="h3" color="white" size="sm">
          Collect your event card on Zupass
        </Heading>
      </div>
      <div className="collect-card-image">
        {/* if users aske a q he gets a special card */}
        {hasUserAskedQuestion
          ? (
            <img
              src={"https://www.biographic.com/wp-content/uploads/2021/09/Meerkat-in-sunset.jpg"}
              alt="Special Card"
            />
          )
          : (
            <img
              src={"https://cdn.britannica.com/57/152457-050-1128A5FE/Meerkat.jpg"}
              alt="Ordinary Card"
            />
          )}
      </div>
      <Flex direction="column" align="center">
        <Button
          isDisabled={!isAuthenticated}
          onClick={() => {
            globalThis.open(event?.proofURL, "_blank");
          }}
          width="12rem"
          bg="linear-gradient(90deg, #8874AA 0%, #53A0F3 139%)"
          _active={{
            bg: "linear-gradient(90deg, #8874AA 0%, #53A0F3 139%)",
          }}
          _hover={{ opacity: isAuthenticated ? 0.8 : 1 }}
          _disabled={{
            bg:
              "linear-gradient(90deg, rgba(136,116,170,0.5) 0%, rgba(83,160,243,0.5) 139%)",
            opacity: 0.6,
            cursor: "not-allowed",
          }}
          color="white"
          fontWeight="bold"
          py={6}
        >
          COLLECT
        </Button>
      </Flex>
    </main>
  );
};

export default Card;
