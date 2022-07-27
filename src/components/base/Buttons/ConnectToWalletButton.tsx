import React from "react";
import { Button, ButtonProps } from "@chakra-ui/react";
import { useHashConnectContext } from "../../../context";

const ConnectToWalletButton = (props: ButtonProps) => {
  const { connectToWallet } = useHashConnectContext();
  return (
    <Button onClick={connectToWallet} {...props}>
      Connect Wallet
    </Button>
  );
};

export { ConnectToWalletButton };
