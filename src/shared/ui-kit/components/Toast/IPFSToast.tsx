import { IconButton, Flex, Link } from "@chakra-ui/react";
import { XIcon } from "../Icons";
import { Color } from "../../themes";
import { ToastContentProps as ToastifyProps } from "react-toastify";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Text } from "../Text";
import { ToastIcon, ToastType } from "./types";

interface IPFSToastProps extends Omit<ToastifyProps, "toastProps"> {
  gatewayURL: string;
  message: string;
  CID: string;
  toastProps?: ToastifyProps["toastProps"];
}

export function IPFSToast(props: IPFSToastProps) {
  const { gatewayURL, closeToast, CID, message, toastProps } = props;
  const ipfsLink = `${gatewayURL}/ipfs/${CID}`;

  return (
    <Flex layerStyle="toast__body">
      {ToastIcon[toastProps?.type as ToastType]}
      <Flex flex="1" direction="column" justifyContent="center">
        <Text.P_XSmall_Regular>{message}</Text.P_XSmall_Regular>
        <Link variant="toast__link" href={ipfsLink} isExternal={true}>
          <Text.P_XSmall_Regular_Link>{"View IPFS content"}</Text.P_XSmall_Regular_Link>
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
