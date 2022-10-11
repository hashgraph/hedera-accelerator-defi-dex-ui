import { RepeatIcon } from "@chakra-ui/icons";
import { Button, Modal, ModalBody, ModalContent, ModalOverlay, Text } from "@chakra-ui/react";

interface ButtonConfig {
  text: string;
  onClick: () => void;
}
interface LoadingDialogProps {
  message: string;
  isOpen: boolean;
  onClose?: () => void;
  width?: number;
  icon?: React.ReactNode;
  buttonConfig?: ButtonConfig;
}

const LoadingDialog = (props: LoadingDialogProps) => {
  const { message, isOpen, onClose, width, icon, buttonConfig } = props;
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
            <>{icon ? icon : <RepeatIcon h={10} w={10} />}</>
            <Text marginTop={"24px"} fontSize={"18px"} lineHeight={"22px"} textAlign="center">
              {message}
            </Text>
            {buttonConfig ? (
              <Button marginTop={"16px"} onClick={buttonConfig.onClick}>
                {buttonConfig.text}
              </Button>
            ) : (
              ""
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { LoadingDialog };
