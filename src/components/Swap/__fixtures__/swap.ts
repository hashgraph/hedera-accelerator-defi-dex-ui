import { SwapProps } from "..";
import { WalletConnectionStatus } from "../../../hooks";

export const mockSwapProps: SwapProps = {
  title: "Swap",
  sendSwapTransaction: () => Promise.resolve(),
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  connectToWallet: () => null,
  clearWalletPairings: () => null,
  fetchSpotPrices: () => null,
  getPoolLiquidity: () => null,
  spotPrices: undefined,
  poolLiquidity: undefined,
  walletData: null,
  network: "testnet",
  metaData: {
    name: "",
    description: "",
    icon: "",
  },
  installedExtensions: null,
  transactionWaitingToBeSigned: false,
};
