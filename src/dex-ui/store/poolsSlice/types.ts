import { StateCreator } from "zustand";
import { DEXState } from "..";

enum PoolsActionType {
  FETCH_ALL_POOL_METRICS_STARTED = "pools/FETCH_ALL_POOL_METRICS_STARTED",
  FETCH_ALL_METRICS_SUCCEEDED = "pools/FETCH_ALL_POOL_METRICS_SUCCEEDED",
  FETCH_ALL_METRICS_FAILED = "pools/FETCH_ALL_POOL_METRICS_FAILED",
  FETCH_USER_POOL_METRICS_STARTED = "pools/FETCH_USER_POOL_METRICS_STARTED",
  FETCH_USER_POOL_METRICS_SUCCEEDED = "pools/FETCH_USER_POOL_METRICS_SUCCEEDED",
  FETCH_USER_POOL_METRICS_FAILED = "pools/FETCH_USER_POOL_METRICS_FAILED",
  SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED = "pools/SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED",
  SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED = "pools/SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED",
  SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED = "pools/SEND_ADD_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED",
}

/* Add Symbol */
interface PoolState {
  name: string;
  fee: number;
  totalVolumeLocked: number;
  past24HoursVolume: number;
  past7daysVolume: number;
}

interface UserPoolState {
  name: string;
  fee: number;
  liquidity: number;
  percentOfPool: number;
  unclaimedFees: number;
}

interface TokenBalance {
  /** Should update this field to be tokenId */
  token_id: string;
  balance: number;
}

interface PoolsState {
  allPoolsMetrics: PoolState[];
  userPoolsMetrics: UserPoolState[];
  poolTokenBalances: TokenBalance[];
  userTokenBalances: TokenBalance[];
  status: string; // "init" | "fetching" | "success" | "error";
  errorMessage: string | null;
}

interface PoolsActions {
  sendAddLiquidityTransaction: ({
    firstTokenAddr,
    firstTokenQty,
    secondTokenAddr,
    secondTokenQty,
    addLiquidityContractAddr,
  }: any) => Promise<void>;
  fetchAllPoolMetrics: () => Promise<void>;
  fetchUserPoolMetrics: (userAccountId: string) => Promise<void>;
  // Temporary - should be removed
  send100LabTokensToWallet: (receivingAccountId: string) => Promise<void>;
}

type PoolsStore = PoolsState & PoolsActions;

type PoolsSlice = StateCreator<DEXState, [["zustand/devtools", never], ["zustand/immer", never]], [], PoolsStore>;

export { PoolsActionType };
export type { PoolsSlice, PoolsStore, PoolsState, PoolsActions, UserPoolState, PoolState };
