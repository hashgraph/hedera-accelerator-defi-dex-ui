import { useEffect, useRef } from "react";
import {
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

interface AlertDialogComponentProps {
  title: string;
  children: React.ReactNode;
  openDialogButtonText: string; // trigger to open dialog
  alertDialogOpen?: boolean; // use this to programtically open/close dialog
  onAlertDialogOpen?: () => void;
  onAlertDialogClose?: () => void;
  modalButtonText?: string; // button at bottom of modal
  onModalButtonClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * <AlertDialogComponent>
 *  Content to be displayed in dialog body
 * </AlertDialogComponent>
 *
 * Usage note:
 * This component has built in functionality to open the AlertDialog on click of the trigger and to close
 * the dialog when the close button in the top right of the modal is clicked.
 *
 * If consumers need to programmatically open or close the dialog outside of the aforementioned base use case,
 * alertDialogOpen prop should be used to set the open/close state. Furthermore, there are callbacks provided
 * (onAlertDialogOpen, onAlertdialogClose) for when the dialog is opened and closed, which should help with
 * dynamic state management of opening and closing
 */
const AlertDialogComponent = (props: AlertDialogComponentProps) => {
  const {
    title,
    children,
    openDialogButtonText,
    alertDialogOpen,
    onAlertDialogOpen,
    onAlertDialogClose,
    modalButtonText,
    onModalButtonClick,
  } = props;
  const cancelRef = useRef<any>();

  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    // For programatically opening/closing dialog
    // when alertDialogOpen is set/unset, accordingly call open and close hooks from useDisclosure
    if (alertDialogOpen) {
      onOpen();
      if (onAlertDialogOpen) onAlertDialogOpen();
    } else {
      onClose();
      if (onAlertDialogClose) onAlertDialogClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertDialogOpen]);

  /** Invoked when dialog is opened. Fires onAlertDialogOpen callback */
  const openDialog = () => {
    onOpen();
    if (onAlertDialogOpen) onAlertDialogOpen();
  };

  /** Invoked when dialog is closed. Fires onAlertDialogClose callback */
  const closeDialog = () => {
    onClose();
    if (onAlertDialogClose) onAlertDialogClose();
  };

  return (
    <>
      <Button onClick={openDialog} marginTop="0.5rem">
        {openDialogButtonText}
      </Button>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent width={"370px"}>
          <AlertDialogHeader padding={"16px"} display={"flex"} justifyContent={"space-between"} alignItems={"center"}>
            <Text fontSize={"24px"} lineHeight={"29px"} fontWeight={"400"}>
              {title}
            </Text>
            <CloseIcon w={4} h={4} onClick={closeDialog} cursor={"pointer"} />
          </AlertDialogHeader>
          <AlertDialogBody padding={"0 16px"}>{children}</AlertDialogBody>
          <AlertDialogFooter padding={"16px"}>
            {modalButtonText ? (
              <Button width={"100%"} ref={cancelRef} onClick={onModalButtonClick}>
                {modalButtonText}
              </Button>
            ) : (
              ""
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export { AlertDialogComponent };
