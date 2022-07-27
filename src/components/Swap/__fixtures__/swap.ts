import { SwapProps } from "..";
import { WalletConnectionStatus } from "../../../hooks";

export const mockSwapProps: SwapProps = {
  inputToken: {
    symbol: "ETH",
    amount: 0.01,
  },
  outputToken: {
    symbol: "USDC",
    amount: 100,
  },
  connectionStatus: WalletConnectionStatus.INITIALIZING,
  // connectToWallet: () => null,
  clearWalletPairings: () => null,
  walletData: null,
  network: "testnet",
  metaData: {
    name: "",
    description: "",
    icon: "",
  },
  installedExtensions: null,
};
