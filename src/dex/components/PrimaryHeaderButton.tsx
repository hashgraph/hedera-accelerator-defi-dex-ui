import { Button } from "@chakra-ui/react";
import { HashConnectConnectionState } from "hashconnect/dist/types";
import { useNavigate } from "react-router-dom";
import { useDexContext } from "../hooks";

interface PrimaryHeaderButtonProps {
  name: string;
  route: string;
}

export function PrimaryHeaderButton(props: PrimaryHeaderButtonProps) {
  const { name, route } = props;
  const [wallet] = useDexContext(({ wallet }) => [wallet]);
  const navigate = useNavigate();
  const isWalletPaired = wallet.hashConnectConnectionState === HashConnectConnectionState.Paired;

  function handleCreateButtonClicked() {
    isWalletPaired ? navigate(route) : wallet.connectToWallet();
  }

  return (
    <Button variant="primary" onClick={handleCreateButtonClicked}>
      {name}
    </Button>
  );
}
