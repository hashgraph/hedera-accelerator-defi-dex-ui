import { cloneElement, useEffect, useRef } from "react";
import {
  chakra,
  Button,
  AlertDialog as ChakraAlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

interface AlertDialogProps {
  title: string;
  openModalComponent?: React.ReactElement;
  body?: React.ReactElement;
  footer?: React.ReactElement;
  children?: React.ReactNode;
  openDialogButtonStyles?: any;
  openDialogButtonText?: string;
  isOpenDialogButtonDisabled?: boolean;
  alertDialogOpen?: boolean;
  size?: string[] | string | undefined;
  dialogWidth?: string;
  onAlertDialogOpen?: () => void;
  onAlertDialogClose?: () => void;
  modalButtonText?: string;
  onModalButtonClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const DEFAULT_DIALOG_WIDTH = "370px";
const DEFAULT_DIALOG_SIZE = "md";

/**
 * <AlertDialog>
 *  Content to be displayed in dialog body
 * </AlertDialog>
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
const AlertDialogBase = (props: AlertDialogProps) => {
  const {
    title,
    openModalComponent,
    body,
    footer,
    size,
    dialogWidth,
    openDialogButtonStyles,
    openDialogButtonText,
    isOpenDialogButtonDisabled,
    alertDialogOpen,
    onAlertDialogOpen,
    onAlertDialogClose,
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
      {openModalComponent ? (
        cloneElement(openModalComponent, { onClick: openDialog })
      ) : (
        <Button
          variant="primary"
          sx={openDialogButtonStyles}
          isDisabled={isOpenDialogButtonDisabled}
          onClick={openDialog}
        >
          {openDialogButtonText}
        </Button>
      )}
      <ChakraAlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        onOverlayClick={closeDialog}
        isOpen={isOpen}
        isCentered
        size={size ?? DEFAULT_DIALOG_SIZE}
      >
        <AlertDialogOverlay />
        <AlertDialogContent
          width={dialogWidth ?? DEFAULT_DIALOG_WIDTH}
          gap="20px"
          padding="20px"
          boxShadow="0px 4px 15px rgba(0, 0, 0, 0.15)"
          borderRadius="2px"
        >
          <AlertDialogHeader padding="0" display="flex" justifyContent="space-between" alignItems="center">
            <Text textStyle="h3">{title}</Text>
            <CloseIcon textStyle="h3" w="3" h="3" onClick={closeDialog} cursor="pointer" />
          </AlertDialogHeader>
          <AlertDialogBody padding="0">{body}</AlertDialogBody>
          <AlertDialogFooter padding="0">{footer ? cloneElement(footer, { ref: cancelRef }) : <></>}</AlertDialogFooter>
        </AlertDialogContent>
      </ChakraAlertDialog>
    </>
  );
};

const AlertDialog = chakra(AlertDialogBase);
export { AlertDialog };
