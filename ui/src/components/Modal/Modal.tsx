import {
  Modal as ChakraModal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  ModalProps as ChakraModalProps,
} from "@chakra-ui/react";

type ModalProps = ChakraModalProps & {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Modal(
  { isOpen, onClose, title, children, ...props }: ModalProps,
) {
  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} {...props} isCentered>
      <ModalOverlay />
      <ModalContent bg="#342749" p="1rem">
        <ModalHeader fontSize="1.5rem" color="white">
          {title}
        </ModalHeader>
        <ModalBody fontWeight="bold">
          {children}
        </ModalBody>
      </ModalContent>
    </ChakraModal>
  );
}
