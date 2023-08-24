import { BigNumber } from "bignumber.js";
import { StateCreator } from "zustand";
import { DEXState } from "..";
import { TransactionResponse } from "@hashgraph/sdk";
import Long from "long";

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
  SEND_CREATE_POOL_TRANSACTION_TO_WALLET_STARTED = "pools/SEND_CREATE_POOL_TRANSACTION_TO_WALLET_STARTED",
  SEND_CREATE_POOL_TRANSACTION_TO_WALLET_SUCCEEDED = "pools/SEND_CREATE_POOL_TRANSACTION_TO_WALLET_SUCCEEDED",
  SEND_CREATE_POOL_TRANSACTION_TO_WALLET_FAILED = "pools/SEND_CREATE_POOL_TRANSACTION_TO_WALLET_FAILED",
  SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED = "pools/SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_STARTED",
  SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED = "pools/SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_SUCCEEDED",
  SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED = "pools/SEND_REMOVE_LIQUIDITY_TRANSACTION_TO_WALLET_FAILED",
  RESET_WITHDRAW_STATE = "pools/RESET_WITHDRAW_STATE",
  RESET_ADD_LIQUIDITY_STATE = "pools/RESET_ADD_LIQUIDITY_STATE",
  RESET_CREATE_POOL_STATE = "pools/RESET_CREATE_POOL_STATE",
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
  lpTokenId: string;
  transactionDeadline: number;
}

interface SendWithdrawTransactionParams {
  tokenSymbol: string;
  lpTokenAmount: number;
  fee: string;
  pairAcountId: string;
  transactionDeadline: number;
  lpAccountId: string;
}

interface SendCreatePoolTransactionParams {
  firstToken: {
    symbol: string;
    amount: number;
    address: string;
  };
  secondToken: {
    symbol: string;
    amount: number;
    address: string;
  };
  transactionDeadline: number;
  transactionFee: number;
}
interface FetchSpotPriceParams {
  inputTokenAddress: string;
  outputTokenAddress: string;
  contractId: string;
}

/* Add Symbol */
interface Pool {
  name: string;
  fee: BigNumber | undefined;
  totalVolumeLocked: BigNumber;
  past24HoursVolume: BigNumber;
  past7daysVolume: BigNumber;
  tokensId: string | undefined;
  pairAccountId: string | undefined;
}

interface UserPool {
  name: string;
  fee: BigNumber | undefined;
  liquidity: BigNumber;
  percentOfPool: BigNumber;
  unclaimedFees: BigNumber;
  userTokenPair: TokenPair | undefined;
}

interface TokenBalance {
  /** Should update this field to be tokenId */
  token_id: string;
  balance: BigNumber;
  decimals?: string;
}
interface MirrorNodeAccountBalance {
  account: string;
  balance: BigNumber;
  tokens: TokenBalance[];
}
interface WithdrawState {
  status: "init" | "in progress" | "success" | "error";
  successPayload: {
    tokenSymbol: string;
    lpTokenAmount: number;
    fee: string;
    transactionResponse: TransactionResponse;
  } | null;
  errorMessage: string;
}

interface AddLiquidityState {
  status: "init" | "in progress" | "success" | "error";
  successPayload: {
    transactionResponse: TransactionResponse;
  } | null;
  errorMessage: string;
}

interface CreatePoolState {
  status: "init" | "in progress" | "success" | "error";
  successPayload: {
    transactionResponse: TransactionResponse;
  } | null;
  errorMessage: string;
}

interface PoolsState {
  allPoolsMetrics: Pool[];
  userPoolsMetrics: UserPool[];
  tokenPairs: TokenPair[];
  poolTokenBalances: MirrorNodeAccountBalance[];
  userTokenBalances: MirrorNodeAccountBalance | undefined;
  status: string; // "init" | "fetching" | "success" | "error";
  errorMessage: string | null;
  withdrawTransactionState: WithdrawState;
  addLiquidityTransactionState: AddLiquidityState;
  createPoolTransactionState: CreatePoolState;
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
  sendRemoveLiquidityTransaction: ({
    tokenSymbol,
    lpTokenAmount,
    fee,
    pairAcountId,
    transactionDeadline,
  }: SendWithdrawTransactionParams) => Promise<void>;
  sendCreatePoolTransaction: (params: SendCreatePoolTransactionParams) => Promise<void>;
  resetWithdrawState: () => Promise<void>;
  resetAddLiquidityState: () => Promise<void>;
  resetCreatePoolState: () => Promise<void>;
}
interface TokenPair {
  tokenA: Token;
  tokenB: Token;
  lpTokenMeta: {
    symbol: string | undefined;
    lpAccountId: string | undefined;
    totalSupply?: Long | null;
    decimals: number;
  };
}

interface Token {
  amount: number;
  displayAmount: string;
  balance: number | undefined;
  poolLiquidity: number | undefined;
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairAccountId: string | undefined;
    tokenId: string | undefined;
    lpTokenId: string | undefined;
    fee: BigNumber | undefined;
  };
}

type PoolsStore = PoolsState & PoolsActions;

type PoolsSlice = StateCreator<DEXState, [["zustand/devtools", never], ["zustand/immer", never]], [], PoolsStore>;

export { PoolsActionType };
export type {
  PoolsSlice,
  PoolsStore,
  PoolsState,
  PoolsActions,
  UserPool,
  Pool,
  SendAddLiquidityTransactionParams,
  SendWithdrawTransactionParams,
  AddLiquidityState,
  WithdrawState,
  CreatePoolState,
  SendCreatePoolTransactionParams,
  TokenPair,
  Token,
  FetchSpotPriceParams,
};
