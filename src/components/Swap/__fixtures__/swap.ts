import { SwapProps } from "..";
import { WalletConnectionStatus } from "../../../hooks";

export const mockSwapProps: SwapProps = {
  title: "Swap",
  sendSwapTransaction: () => Promise.resolve(),
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  connectToWallet: () => null,
  clearWalletPairings: () => null,
  fetchSpotPrices: () => null,
  spotPrices: undefined,
  walletData: null,
  network: "testnet",
  metaData: {
    name: "",
    description: "",
    icon: "",
  },
  installedExtensions: null,
};
