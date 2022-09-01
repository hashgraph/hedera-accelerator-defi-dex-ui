import { SwapProps } from "..";
import { WalletConnectionStatus } from "../../../hooks";

export const mockSwapProps: SwapProps = {
  // inputToken: {
  //   symbol: "ETH",
  //   amount: 0.01,
  // },
  // outputToken: {
  //   symbol: "USDC",
  //   amount: 100,
  // },
  title: "Swap",
  sendSwapTransaction: () => Promise.resolve(),
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  // connectToWallet: () => null,
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
