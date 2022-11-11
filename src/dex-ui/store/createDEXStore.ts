import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand";
import { devtools } from "zustand/middleware";
import { createAppSlice, AppStore } from "./appSlice";
import { createWalletSlice, WalletStore } from "./walletSlice";
import { createSwapSlice, SwapStore } from "./swapSlice";
import { createPoolsSlice, PoolsStore } from "./poolsSlice";
import { DEXProviderProps } from "../context";
import { DEFAULT_APP_METADATA } from "../context/constants";
import { createGovernanceSlice, GovernanceStore } from "./governanceSlice";

interface DEXState {
  context: DEXProviderProps;
  app: AppStore;
  wallet: WalletStore;
  swap: SwapStore;
  pools: PoolsStore;
  governance: GovernanceStore;
}

type DEXStore = ReturnType<typeof createDEXStore>;

export const DEFAULT_DEX_PROVIDER_PROPS: DEXProviderProps = {
  DEXMetaData: DEFAULT_APP_METADATA,
  network: "testnet",
  debug: false,
};

const createDEXStore = (intialContext: DEXProviderProps) => {
  return createStore<DEXState>()(
    devtools(
      immer((...params) => ({
        context: { ...DEFAULT_DEX_PROVIDER_PROPS, ...intialContext },
        app: { ...createAppSlice(...params) },
        wallet: { ...createWalletSlice(...params) },
        swap: { ...createSwapSlice(...params) },
        pools: { ...createPoolsSlice(...params) },
        governance: { ...createGovernanceSlice(...params) },
      }))
    )
  );
};

export { createDEXStore };
export type { DEXState, DEXStore };
