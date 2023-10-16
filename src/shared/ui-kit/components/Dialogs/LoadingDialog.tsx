import { Button, Modal, ModalBody, ModalContent, ModalOverlay, Spacer, Spinner, Text } from "@chakra-ui/react";

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
  buttons?: React.ReactElement;
}

/**
 * TODO: Add TSDocs
 */
const LoadingDialog = (props: LoadingDialogProps) => {
  const { message, isOpen, onClose, width, icon, buttonConfig, buttons } = props;

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
        <ModalContent
          width={width ? `${width}px` : "317px"}
          boxShadow="0px 4px 15px rgba(0, 0, 0, 0.15)"
          borderRadius="5px"
        >
          <ModalBody
            width={"100%"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            alignItems={"center"}
            padding={"1.5rem 0.75rem 0rem"}
          >
            <>
              {icon ? (
                icon
              ) : (
                <Spinner color="#31A9BD" thickness="4px" speed="0.65s" emptyColor="gray.200" h={10} w={10} />
              )}
            </>
            <Spacer margin="12px" />
            <Text textStyle="b1" textAlign="center">
              {message}
            </Text>
            <Spacer margin="8px" />
            {buttonConfig ? (
              <>
                <Button variant="primary" width="256px" onClick={buttonConfig.onClick}>
                  {buttonConfig.text}
                </Button>
                <Spacer margin="8px" />
              </>
            ) : (
              <></>
            )}
            {buttons ? buttons : <></>}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { LoadingDialog };
