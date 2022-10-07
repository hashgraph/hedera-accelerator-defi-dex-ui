import { immer } from "zustand/middleware/immer";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { fetchAccountBalances, fetchAccountTransactions, fetchTokenPairs } from "./services";
import { getErrorMessage } from "../utils";
import { ActionType, MirrorNodeState } from "./types";
import { SWAP_CONTRACT_ID } from "../constants";
import { calculatePoolMetrics, calculateUserPoolMetrics, getTimestamp24HoursAgo, getTimestamp7DaysAgo } from "./utils";

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
      fetchAllPoolMetrics: async (/*need user Token Pairs & LP balances*/) => {
        set({ status: "fetching" }, false, ActionType.FETCH_POOL_METRICS_STARTED);
        try {
          const poolAccountBalances = await fetchAccountBalances(SWAP_CONTRACT_ID);
          // THIS IS MOCKED: Need to add pair tokens to contract.
          poolAccountBalances.data.balances
            .find((poolAccountBalance: any) => poolAccountBalance.account === SWAP_CONTRACT_ID)
            ?.tokens.push({
              token_id: "0.0.48143347",
              balance: 1000,
            });
          const timestamp24HoursAgo = getTimestamp24HoursAgo();
          const timestamp7DaysAgo = getTimestamp7DaysAgo();
          const last24Transactions = await fetchAccountTransactions(SWAP_CONTRACT_ID, timestamp24HoursAgo);
          const last7DTransactions = await fetchAccountTransactions(SWAP_CONTRACT_ID, timestamp7DaysAgo);
          const poolTokenPairs = await fetchTokenPairs();
          const allPoolsMetrics = poolTokenPairs.map((tokenPair) => {
            return calculatePoolMetrics({
              poolAccountId: SWAP_CONTRACT_ID,
              poolAccountBalances: poolAccountBalances.data.balances,
              last24Transactions: last24Transactions.data.transactions,
              last7DTransactions: last7DTransactions.data.transactions,
              tokenPair,
            });
          });

          const userAccountId = "0.0.34728121";
          const userAccountBalances = await fetchAccountBalances(userAccountId);
          // return if user has pair token in walet
          const userLPTokensList = poolTokenPairs.filter((poolTokenPair) => {
            const userTokenBalances = userAccountBalances.data.balances.find(
              (userAccountBalance: any) => userAccountBalance.account === userAccountId // wallet address
            )?.tokens;
            return userTokenBalances.some(
              (userTokenBalance: any) => userTokenBalance.token_id === poolTokenPair.pairToken.accountId
            );
          });
          const userPoolsMetrics = userLPTokensList.map((tokenPair) => {
            return calculateUserPoolMetrics({
              allPoolsMetrics,
              poolAccountBalances: poolAccountBalances.data.balances,
              userAccountBalances: userAccountBalances.data.balances,
              tokenPair,
            });
          });
          set({ status: "success", allPoolsMetrics, userPoolsMetrics }, false, ActionType.FETCH_POOL_METRICS_SUCCEEDED);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ status: "error", errorMessage }, false, ActionType.FETCH_POOL_METRICS_STARTED);
        }
      },
    }))
  )
);

export { useMirrorNode, initialMirrorNodeState };
