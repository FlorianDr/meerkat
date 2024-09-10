import { Button } from "@chakra-ui/react";

export interface ActionButtonProps {
  text: string;
  onClick: () => void;
  isDisabled?: boolean;
}

export function ActionButton(
  { text, onClick, isDisabled }: ActionButtonProps,
) {
  return (
    <Button
      isDisabled={isDisabled}
      bg="none"
      p={2}
      size="sm"
      color="rgba(136, 116, 170, 1)"
      border="solid 0.1px rgba(136, 116, 170, 1)"
      width="6rem"
      _hover={{ opacity: isDisabled ? "none" : 0.8 }}
      _active={{ opacity: isDisabled ? "none" : 0.8 }}
      fontWeight="bold"
      py={2}
      position="relative"
      bottom={15}
      onClick={onClick}
      type="button"
    >
      {text}
    </Button>
  );
}
