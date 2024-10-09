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
    <ChakraModal isOpen={isOpen} onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
      </ModalContent>
    </ChakraModal>
  );
}
