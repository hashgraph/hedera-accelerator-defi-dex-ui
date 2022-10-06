import { RepeatIcon } from "@chakra-ui/icons";
import { Modal, ModalBody, ModalContent, ModalOverlay, Text } from "@chakra-ui/react";

interface LoadingDialogProps {
  message: string;
  isOpen: boolean;
  onClose?: () => void;
  width?: number;
}

const LoadingDialog = (props: LoadingDialogProps) => {
  const { message, isOpen, onClose, width } = props;
  return (
    <>
      <Modal
        isOpen={isOpen}
        isCentered={true}
        closeOnOverlayClick={false}
        closeOnEsc={false}
        onClose={onClose ? onClose : () => null}
      >
        <ModalOverlay />
        <ModalContent width={width ? `${width}px` : "317px"}>
          <ModalBody
            width={"100%"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            padding={"24px 8px"}
          >
            <RepeatIcon h={10} w={10} />
            <Text marginTop={"24px"} fontSize={"18px"} lineHeight={"22px"} textAlign="center">
              {message}
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { LoadingDialog };
