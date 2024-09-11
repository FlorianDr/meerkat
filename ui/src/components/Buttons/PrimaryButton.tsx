import { Button } from "@chakra-ui/react";

export function PrimaryButton(
  { onClick, isDisabled, children }: {
    children?: React.ReactNode;
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
      {children}
    </Button>
  );
}
