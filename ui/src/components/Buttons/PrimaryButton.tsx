import { Button } from "@chakra-ui/react";

export function PrimaryButton(
  { text, onClick, isDisabled }: {
    text: string;
    onClick: () => void;
    isDisabled: boolean;
  },
) {
  return (
    <Button
      onClick={onClick}
      width="16rem"
      bg="linear-gradient(90deg, #8874AA 0%, #53A0F3 139%)"
      _active={{
        bg: "linear-gradient(90deg, #8874AA 0%, #53A0F3 139%)",
      }}
      _hover={{ opacity: 0.8 }}
      color="white"
      fontWeight="bold"
      py={6}
      isDisabled={isDisabled}
    >
      {text}
    </Button>
  );
}
