import { BigNumber } from "bignumber.js";
import { StateCreator } from "zustand";
import { DEXState } from "..";
import { TransactionResponse } from "@hashgraph/sdk";

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
  SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED = "pools/SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED",
  SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED = "pools/SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED",
  SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED = "pools/SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED",
  RESET_WITHDRAW_STATE = "pools/RESET_WITHDRAW_STATE",
}

interface SendAddLiquidityTransactionParams {
  inputToken: {
    symbol: string;
    amount: number;
    address: string;
  };
  outputToken: {
    symbol: string;
    amount: number;
    address: string;
  };
  contractId: string;
}

/* Add Symbol */
interface Pool {
  name: string;
  fee: BigNumber | undefined;
  totalVolumeLocked: BigNumber;
  past24HoursVolume: BigNumber;
  past7daysVolume: BigNumber;
}

interface UserPool {
  name: string;
  fee: BigNumber | undefined;
  liquidity: BigNumber;
  percentOfPool: BigNumber;
  unclaimedFees: BigNumber;
}

interface TokenBalance {
  /** Should update this field to be tokenId */
  token_id: string;
  balance: BigNumber;
  decimals?: string;
}

interface WithdrawState {
  status: "init" | "in progress" | "success" | "error";
  successPayload: {
    lpTokenSymbol: string;
    lpTokenAmount: number;
    userPercentOfPool: number;
    transactionResponse: TransactionResponse;
  } | null;
  errorMessage: string;
}
interface PoolsState {
  allPoolsMetrics: Pool[];
  userPoolsMetrics: UserPool[];
  poolTokenBalances: TokenBalance[];
  userTokenBalances: TokenBalance[];
  status: string; // "init" | "fetching" | "success" | "error";
  errorMessage: string | null;
  withdrawState: WithdrawState;
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
  sendRemoveLiquidityTransaction: (
    lpTokenSymbol: string,
    lpTokenAmount: number,
    userPercentOfPool: number
  ) => Promise<void>;
  resetWithdrawState: () => Promise<void>;
  // Temporary - should be removed
  send100LabTokensToWallet: (receivingAccountId: string) => Promise<void>;
}

type PoolsStore = PoolsState & PoolsActions;

type PoolsSlice = StateCreator<DEXState, [["zustand/devtools", never], ["zustand/immer", never]], [], PoolsStore>;

export { PoolsActionType };
export type { PoolsSlice, PoolsStore, PoolsState, PoolsActions, UserPool, Pool, SendAddLiquidityTransactionParams };
