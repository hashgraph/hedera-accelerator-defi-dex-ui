import { immer } from "zustand/middleware/immer";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { fetchAccountBalances, fetchAccountTransactions, fetchTokenPairs } from "./services";
import { getErrorMessage } from "../utils";
import { ActionType, MirrorNodeState } from "./types";
import { SWAP_CONTRACT_ID } from "../constants";
import { calculatePoolMetrics, getTimestamp24HoursAgo, getTimestamp7DaysAgo } from "./utils";

const initialMirrorNodeState: MirrorNodeState = {
  allPoolsMetrics: [],
  userPoolsMetrics: [],
  status: "init",
  errorMessage: null,
  fetchAllPoolMetrics: () => Promise.resolve(),
};

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
      fetchAllPoolMetrics: async () => {
        set({ status: "fetching" }, false, ActionType.FETCH_POOL_METRICS_STARTED);
        try {
          const accountBalances = await fetchAccountBalances(SWAP_CONTRACT_ID);
          const timestamp24HoursAgo = getTimestamp24HoursAgo();
          const timestamp7DaysAgo = getTimestamp7DaysAgo();
          const last24Transactions = await fetchAccountTransactions(SWAP_CONTRACT_ID, timestamp24HoursAgo);
          const last7DTransactions = await fetchAccountTransactions(SWAP_CONTRACT_ID, timestamp7DaysAgo);
          const tokenPairs = await fetchTokenPairs();
          const allPoolsMetrics = tokenPairs.map((tokenPair) => {
            return calculatePoolMetrics({
              accountBalances: accountBalances.data.balances,
              last24Transactions: last24Transactions.data.transactions,
              last7DTransactions: last7DTransactions.data.transactions,
              tokenPair,
            });
          });
          set({ status: "success", allPoolsMetrics }, false, ActionType.FETCH_POOL_METRICS_SUCCEEDED);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ status: "error", errorMessage }, false, ActionType.FETCH_POOL_METRICS_STARTED);
        }
      },
    }))
  )
);

export { useMirrorNode, initialMirrorNodeState };
