import { BigNumber } from "bignumber.js";
import { TransactionResponse } from "@hashgraph/sdk";
import { StateCreator } from "zustand";
import { DEXState } from "..";

enum SwapActionType {
  FETCH_SPOT_PRICES_STARTED = "swap/FETCH_SPOT_PRICES_STARTED",
  FETCH_SPOT_PRICES_SUCCEEDED = "swap/FETCH_SPOT_PRICES_SUCCEEDED",
  FETCH_SPOT_PRICES_FAILED = "swap/FETCH_SPOT_PRICES_FAILED",
  SEND_SWAP_TRANSACTION_TO_WALLET_STARTED = "swap/SEND_SWAP_TRANSACTION_TO_WALLET_STARTED",
  SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED = "swap/SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED",
  SEND_SWAP_TRANSACTION_TO_WALLET_FAILED = "swap/SEND_SWAP_TRANSACTION_TO_WALLET_FAILED",
  FETCH_POOL_LIQUIDITY_STARTED = "swap/FETCH_POOL_LIQUIDITY_STARTED",
  FETCH_POOL_LIQUIDITY_SUCCEEDED = "swap/FETCH_POOL_LIQUIDITY_SUCCEEDED",
  FETCH_POOL_LIQUIDITY_FAILED = "swap/FETCH_POOL_LIQUIDITY_FAILED",
  SIGN_SWAP_TRANSACTION_STARTED = "swap/SIGN_SWAP_TRANSACTION_STARTED",
  SIGN_SWAP_TRANSACTION_SUCCEEDED = "swap/SIGN_SWAP_TRANSACTION_SUCCEEDED",
}

interface TransactionState {
  transactionWaitingToBeSigned: boolean;
  successPayload: TransactionResponse | null;
  errorMessage: string;
}
interface SwapState {
  precision: number;
  spotPrices: Record<string, number | undefined>;
  poolLiquidity: Record<string, number | undefined>;
  transactionState: TransactionState;
  errorMessage: string | null;
}

interface SwapActions {
  getPrecision: () => Promise<void>;
  withPrecision: (value: number) => BigNumber;
  fetchSpotPrices: () => Promise<void>;
  getPoolLiquidity: (tokenToTrade: string, tokenToReceive: string) => Promise<void>;
  sendSwapTransaction: ({ tokenToTrade, tokenToReceive }: any) => Promise<void>;
}

type SwapStore = SwapState & SwapActions;

type SwapSlice = StateCreator<DEXState, [["zustand/devtools", never], ["zustand/immer", never]], [], SwapStore>;

export { SwapActionType };
export type { SwapSlice, SwapStore, SwapState, SwapActions, TransactionState };
