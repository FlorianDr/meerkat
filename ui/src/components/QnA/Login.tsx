import {
  Button,
  Flex,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  Heading,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import { User } from "../../hooks/use-user.ts";
import { Event } from "../../hooks/use-event.ts";

interface LoginProps {
  user: User | undefined;
  isAuthenticated: boolean;
  event: Event | undefined;
}

export function Login({ user, isAuthenticated, event }: LoginProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      {isAuthenticated ? (
        <>Signed with uid {user?.uid}</>
      ) : (
        <Link onClick={onOpen}>Login</Link>
      )}
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
              <Button
                onClick={() => {
                  globalThis.open(event?.proofURL, "_blank");
                }}
                width="16rem"
                bg="linear-gradient(90deg, #8874AA 0%, #53A0F3 139%)"
                _active={{
                  bg: "linear-gradient(90deg, #8874AA 0%, #53A0F3 139%)",
                }}
                _hover={{ opacity: 0.8 }}
                color="white"
                fontWeight="bold"
                py={6}
              >
                LOGIN
              </Button>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
