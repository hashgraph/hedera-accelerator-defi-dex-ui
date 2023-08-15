import { StateCreator } from "zustand";
import { DEXState } from "..";
import { PoolsState } from "../poolsSlice";
import { SwapState } from "../swapSlice";
import { WalletState } from "../walletSlice";

enum TransactionStatus {
  INIT = "init",
  IN_PROGRESS = "in progress",
  SUCCESS = "success",
  ERROR = "error",
}

enum AppActionType {
  SET_FEATURES_AS_LOADING = "app/SET_FEATURES_AS_LOADING",
  SET_FEATURES_AS_LOADED = "app/SET_FEATURES_AS_LOADED",
}

type AppFeatures = keyof WalletState | keyof SwapState | keyof PoolsState;

interface AppState {
  featuresLoading: Set<AppFeatures>;
}

interface AppActions {
  isFeatureLoading: (feature: AppFeatures) => boolean;
  setFeaturesAsLoading: (features: Array<AppFeatures>) => void;
  setFeaturesAsLoaded: (features: Array<AppFeatures>) => void;
}

type AppStore = AppState & AppActions;

type AppSlice = StateCreator<DEXState, [["zustand/devtools", never], ["zustand/immer", never]], [], AppStore>;

export { AppActionType, TransactionStatus };
export type { AppSlice, AppStore, AppState, AppActions, AppFeatures };
