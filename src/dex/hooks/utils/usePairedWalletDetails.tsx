import { HashConnectConnectionState } from "hashconnect/dist/types";
import { useDexContext } from "@dex/hooks";

export function usePairedWalletDetails() {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const isWalletPaired = wallet.hashConnectConnectionState === HashConnectConnectionState.Paired;
  const walletId = isWalletPaired ? wallet.savedPairingData?.accountIds[0] : "";
  return { isWalletPaired, walletId };
}
