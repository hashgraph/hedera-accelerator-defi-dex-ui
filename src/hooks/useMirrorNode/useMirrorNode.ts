import { immer } from "zustand/middleware/immer";
import create from "zustand";
import { devtools } from "zustand/middleware";
import { fetchAccountBalances, fetchAccountTransactions, fetchTokenPairs } from "./services";
import { getErrorMessage } from "../utils";
import { ActionType, MirrorNodeAccountBalance, MirrorNodeState, MirrorNodeTokenBalance } from "./types";
import { A_B_PAIR_TOKEN_ID, SWAP_CONTRACT_ID } from "../constants";
import {
  calculatePoolMetrics,
  calculateUserPoolMetrics,
  getTimestamp7DaysAgo,
  getTokenBalances,
  getTransactionsFromLast24Hours,
} from "./utils";

const initialMirrorNodeState: MirrorNodeState = {
  allPoolsMetrics: [],
  userPoolsMetrics: [],
  poolTokenBalances: [],
  userTokenBalances: [],
  status: "init",
  errorMessage: null,
  fetchAllPoolMetrics: () => Promise.resolve(),
  fetchUserPoolMetrics: () => Promise.resolve(),
};

/**
 * TODO: This is mocked data that adds a token pair balance to the primary pool balance data.
 * This should be removed after we can fetch pair tokens from the pool contract.
 * */
const appendLiquidityTokenBalance = (poolAccountBalances: MirrorNodeAccountBalance[]) => {
  const mockedLiquidityTokenBalance = {
    token_id: A_B_PAIR_TOKEN_ID,
    balance: 1000,
  };
  poolAccountBalances
    .find((poolAccountBalance: any) => poolAccountBalance.account === SWAP_CONTRACT_ID)
    ?.tokens.push(mockedLiquidityTokenBalance);
  return poolAccountBalances;
};

/**
 * A hook that provides access to functions that fetch transaction and account
 * information from a Hedera managed mirror node.
 * @returns - The state of the mirror node data as well as functions that can be used to fetch
 * the latest mirror node network data.
 */
const useMirrorNode = create<MirrorNodeState>()(
  devtools(
    immer((set, get) => ({
      allPoolsMetrics: [],
      userPoolsMetrics: [],
      poolTokenBalances: [],
      userTokenBalances: [],
      status: "init",
      errorMessage: null,
      fetchAllPoolMetrics: async () => {
        set({ status: "fetching" }, false, ActionType.FETCH_ALL_POOL_METRICS_STARTED);
        try {
          const poolAccountBalances = appendLiquidityTokenBalance(await fetchAccountBalances(SWAP_CONTRACT_ID));
          const poolTokenBalances = getTokenBalances(poolAccountBalances, SWAP_CONTRACT_ID);
          const timestamp7DaysAgo = getTimestamp7DaysAgo();
          const last7DTransactions = await fetchAccountTransactions(SWAP_CONTRACT_ID, timestamp7DaysAgo);
          const last24Transactions = getTransactionsFromLast24Hours(last7DTransactions);
          const poolTokenPairs = await fetchTokenPairs();
          const allPoolsMetrics = poolTokenPairs.map((tokenPair) => {
            return calculatePoolMetrics({
              poolAccountId: SWAP_CONTRACT_ID,
              poolTokenBalances,
              last24Transactions,
              last7DTransactions,
              tokenPair,
            });
          });
          set({ status: "success", allPoolsMetrics, poolTokenBalances }, false, ActionType.FETCH_ALL_METRICS_SUCCEEDED);
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ status: "error", errorMessage }, false, ActionType.FETCH_ALL_METRICS_FAILED);
        }
      },
      fetchUserPoolMetrics: async (userAccountId: string) => {
        set({ status: "fetching" }, false, ActionType.FETCH_USER_POOL_METRICS_STARTED);
        try {
          const userAccountBalances = await fetchAccountBalances(userAccountId);
          const poolTokenPairs = await fetchTokenPairs();
          const userTokenBalances = getTokenBalances(userAccountBalances, userAccountId);
          const userLiquidityPoolTokensList = poolTokenPairs.filter((poolTokenPair) => {
            return userTokenBalances.some(
              (userTokenBalance: MirrorNodeTokenBalance) =>
                userTokenBalance.token_id === poolTokenPair.pairToken.accountId
            );
          });
          const userPoolsMetrics = userLiquidityPoolTokensList.map((userTokenPair) => {
            return calculateUserPoolMetrics({
              poolTokenBalances: get().poolTokenBalances,
              userTokenBalances,
              userTokenPair,
            });
          });
          set(
            { status: "success", userPoolsMetrics, userTokenBalances },
            false,
            ActionType.FETCH_USER_POOL_METRICS_SUCCEEDED
          );
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          set({ status: "error", errorMessage }, false, ActionType.FETCH_USER_POOL_METRICS_FAILED);
        }
      },
    }))
  )
);

export { useMirrorNode, initialMirrorNodeState };
