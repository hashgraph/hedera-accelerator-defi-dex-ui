import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { useDexContext } from "@hooks";

export function usePairedWalletDetails() {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const isWalletPaired = wallet.hashConnectConnectionState === HashConnectConnectionState.Paired;
  const walletId = isWalletPaired ? wallet.savedPairingData?.accountIds[0] : "";
  return { isWalletPaired, walletId };
}
