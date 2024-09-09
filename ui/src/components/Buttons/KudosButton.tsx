import { Button } from "@chakra-ui/react";

export function KudosButton() {
  return (
    <Button
      bg="none"
      p={2}
      size="sm"
      color="rgba(136, 116, 170, 1)"
      border="solid 0.1px rgba(136, 116, 170, 1)"
      width="6rem"
      _hover={1}
      fontWeight="bold"
      py={2}
      position="relative"
      bottom={15}
      _active={{
        bg: "linear-gradient(90deg, #8874AA 0%, #53A0F3 139%)",
      }}
      type="button"
    >
      Kudos
    </Button>
  );
}
