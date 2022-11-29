import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { SwapTokensProps } from "..";

export const mockSwapProps: SwapTokensProps = {
  title: "Swap",
  sendSwapTransaction: () => Promise.resolve(),
  connectionStatus: HashConnectConnectionState.Disconnected,
  connectToWallet: () => null,
  getPoolLiquidity: () => null,
  spotPrices: {},
  fee: "0.01",
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
  isFeatureLoading: () => false,
  tokenPairs: [],
};
