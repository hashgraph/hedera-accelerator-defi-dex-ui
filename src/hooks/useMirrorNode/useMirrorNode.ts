import { immer } from "zustand/middleware/immer";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { fetchTokenBalances } from "./services";
import { getErrorMessage } from "../utils";
import { ActionType, MirrorNodeState } from "./types";

const initialMirrorNodeState: MirrorNodeState = {
  allPoolsMetrics: new Map(),
  userPoolsMetrics: new Map(),
  status: "init",
  errorMessage: null,
  poolVolumeMetrics: null,
  fetchPoolVolumeMetrics: () => Promise.resolve(),
};

const calculatePoolVolumeMetrics = (accountBalances: []) => {
  return accountBalances.reduce((acc: number, value: any): number => acc + value.balance, 0);
};

const useMirrorNode = create<MirrorNodeState>()(
  devtools(
    immer((set) => ({
      allPoolsMetrics: new Map(),
      userPoolsMetrics: new Map(),
      status: "init",
      errorMessage: null,
      poolVolumeMetrics: null,
      fetchPoolVolumeMetrics: async (/*{ tokenAccountId, timestamp }*/) => {
        set({ status: "fetching" }, false, ActionType.FETCH_POOL_VOLUME_METRICS_STARTED);
        try {
          const response = await fetchTokenBalances();
          console.log(response.data);
          const poolVolumeMetrics = calculatePoolVolumeMetrics(response.data.balances);
          console.log(poolVolumeMetrics);
          set({ status: "success", poolVolumeMetrics }, false, ActionType.FETCH_POOL_VOLUME_METRICS_SUCCEEDED);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ status: "error", errorMessage }, false, ActionType.FETCH_POOL_VOLUME_METRICS_STARTED);
        }
      },
    }))
  )
);

export { useMirrorNode, initialMirrorNodeState };
