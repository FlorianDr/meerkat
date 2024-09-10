import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Heading,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import { User } from "../../hooks/use-user.ts";
import { Event } from "../../hooks/use-event.ts";
import { PrimaryButton } from "../Buttons/PrimaryButton.tsx";

interface LoginProps {
  user: User | undefined;
  isAuthenticated: boolean;
  event: Event | undefined;
}

export function Login({ user, isAuthenticated, event }: LoginProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {isAuthenticated
        ? <>Signed with uid {user?.uid}</>
        : <Link href={event?.proofURL}>Login</Link>}
      <Drawer
        isOpen={isOpen}
        placement="bottom"
        onClose={onClose}
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
              <PrimaryButton
                text="LOGIN"
                onClick={() => {}}
                isDisabled={isAuthenticated}
              />
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
