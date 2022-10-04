import { immer } from "zustand/middleware/immer";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { fetchAccountBalances } from "./services";
import { getErrorMessage } from "../utils";
import { calculatePoolVolumeMetrics } from "./utils";
import { ActionType, MirrorNodeState, TokenPair } from "./types";
import { L49A_TOKEN_ID, L49B_TOKEN_ID, SWAP_CONTRACT_ID } from "../constants";

const initialMirrorNodeState: MirrorNodeState = {
  allPoolsMetrics: [],
  userPoolsMetrics: [],
  status: "init",
  errorMessage: null,
  poolVolumeMetrics: null,
  fetchAllPoolMetrics: () => Promise.resolve(),
};

// TODO: This should be replaced with a mirror call to fetch all pairs associated with the primary swap/pool contract.
const getTokenPairs = (): TokenPair[] => [
  { tokenA: { symbol: "L49A", accountId: L49A_TOKEN_ID }, tokenB: { symbol: "L49B", accountId: L49B_TOKEN_ID } },
];

/**
 * A hook that provides access to functions that fetch transaction and account
 * information from a Hedera managed mirror node.
 * @returns - The state of the mirror node data as well as functions that can be used to fetch
 * the latest mirror node network data.
 */
const useMirrorNode = create<MirrorNodeState>()(
  devtools(
    immer((set) => ({
      allPoolsMetrics: [],
      userPoolsMetrics: [],
      status: "init",
      errorMessage: null,
      poolVolumeMetrics: null,
      fetchAllPoolMetrics: async () => {
        set({ status: "fetching" }, false, ActionType.FETCH_POOL_VOLUME_METRICS_STARTED);
        try {
          const response = await fetchAccountBalances(SWAP_CONTRACT_ID);
          const tokenPairs = getTokenPairs();
          const allPoolsMetrics = tokenPairs.map((tokenPair) => {
            return calculatePoolVolumeMetrics(response.data.balances, tokenPair);
          });
          set({ status: "success", allPoolsMetrics }, false, ActionType.FETCH_POOL_VOLUME_METRICS_SUCCEEDED);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ status: "error", errorMessage }, false, ActionType.FETCH_POOL_VOLUME_METRICS_STARTED);
        }
      },
    }))
  )
);

export { useMirrorNode, initialMirrorNodeState };
