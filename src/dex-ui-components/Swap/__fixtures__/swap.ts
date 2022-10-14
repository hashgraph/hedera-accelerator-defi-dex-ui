import { SwapProps } from "..";
import { WalletConnectionStatus } from "../../../dex-ui/store/walletSlice";

export const mockSwapProps: SwapProps = {
  title: "Swap",
  sendSwapTransaction: () => Promise.resolve(),
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  connectToWallet: () => null,
  clearWalletPairings: () => null,
  fetchSpotPrices: () => null,
  getPoolLiquidity: () => null,
  spotPrices: {},
  poolLiquidity: {},
  walletData: null,
  network: "testnet",
  metaData: {
    name: "",
    description: "",
    icon: "",
  },
  installedExtensions: null,
  transactionState: {
    transactionWaitingToBeSigned: false,
    successPayload: null,
    errorMessage: "",
  },
};
