import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Heading,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { User } from "../../hooks/use-user.ts";
import { Event } from "../../hooks/use-event.ts";

interface LoginProps {
  user: User | undefined;
  isAuthenticated: boolean;
  event: Event | undefined;
}

export function Login({ user, isAuthenticated, event }: LoginProps) {
  const isOpen = !isAuthenticated;

  return (
    <>
      {isAuthenticated && <>Signed with uid {user?.uid}</>}
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={() => {}}
        autoFocus={false}
        returnFocusOnClose={false}
      >
        <DrawerOverlay />
        <DrawerContent
          bg="rgba(1, 1, 1, 0.8)"
          color="white"
          borderTopRadius="sm"
          position="absolute"
          bottom="100%"
          left="0"
          right="0"
          maxWidth="100%"
          p={24}
        >
          <DrawerBody p={6}>
            <Flex direction="column" align="center">
              <Heading as="h1" color="white" size="sm" mb={8}>
                Login to participate:
              </Heading>
              <Link href={event?.proofURL}>
                Login with Zupass <ExternalLinkIcon mx="2px" />
              </Link>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
