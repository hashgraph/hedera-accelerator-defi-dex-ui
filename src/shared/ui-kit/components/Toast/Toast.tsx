import { IconButton, Flex, Link } from "@chakra-ui/react";
import { ToastErrorIcon, ToastSuccessIcon, ToastInfoIcon, XIcon } from "../Icons";
import { Color } from "../../themes";
import { ToastContentProps as ToastifyProps } from "react-toastify";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { createHashScanTransactionLink } from "@dex/utils";
import { Text } from "../Text";

enum ToastType {
  Success = "success",
  Error = "error",
  Info = "info",
}

const ToastIcon = {
  [ToastType.Success]: <ToastSuccessIcon boxSize="8" />,
  [ToastType.Error]: <ToastErrorIcon boxSize="8" />,
  [ToastType.Info]: <ToastInfoIcon boxSize="8" />,
};

interface ToastProps extends Omit<ToastifyProps, "toastProps"> {
  message: string;
  transactionId: string;
  toastProps?: ToastifyProps["toastProps"];
}

export function Toast(props: ToastProps) {
  const { closeToast, transactionId, message, toastProps } = props;
  const hashscanTransactionLink = createHashScanTransactionLink(transactionId);

  return (
    <Flex layerStyle="toast__body">
      {ToastIcon[toastProps?.type as ToastType]}
      <Flex flex="1" direction="column" justifyContent="center">
        <Text.P_XSmall_Regular>{message}</Text.P_XSmall_Regular>
        <Link variant="toast__link" href={hashscanTransactionLink} isExternal={true}>
          <Text.P_XSmall_Regular_Link>{"View in HashScan"}</Text.P_XSmall_Regular_Link>
          <ExternalLinkIcon margin="0rem 0.125rem" color={Color.Primary._500} />
        </Link>
      </Flex>
      <IconButton
        bg="none"
        isRound={true}
        icon={<XIcon color={Color.Neutral._400} />}
        onClick={closeToast}
        aria-label="Close toast"
        _hover={{ bg: "none" }}
        _focus={{ bg: "none" }}
      />
    </Flex>
  );
}
