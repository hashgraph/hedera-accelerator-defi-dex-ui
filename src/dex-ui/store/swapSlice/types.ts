import { BigNumber } from "bignumber.js";
import { TransactionResponse, TokenId, TokenType } from "@hashgraph/sdk";
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
  FETCH_SWAP_FEE_STARTED = "swap/FETCH_SWAP_FEE_STARTED",
  FETCH_SWAP_FEE_SUCCEEDED = "swap/FETCH_SWAP_FEE_SUCCEEDED",
  FETCH_SWAP_FEE_FAILED = "swap/FETCH_SWAP_FEE_FAILED",
  SET_PRECISION = "swap/SET_PRECISION",
  SET_TOKEN_PAIRS = "swap/SET_TOKEN_PAIRS",
}
interface TokenPair {
  symbol: string;
  tokenId: TokenId;
  tokenType: TokenType | null;
  tokenName: string;
  totalSupply: Long | null;
  maxSupply: Long | null;
}
interface TransactionState {
  transactionWaitingToBeSigned: boolean;
  successPayload: TransactionResponse | null;
  errorMessage: string;
}
interface SwapState {
  precision: BigNumber | undefined;
  fee: BigNumber | undefined;
  spotPrices: Record<string, BigNumber | undefined>;
  poolLiquidity: Record<string, BigNumber | undefined>;
  transactionState: TransactionState;
  errorMessage: string | null;
  tokenPairs: TokenPair[] | null;
}

interface SwapActions {
  getPrecision: () => void;
  fetchSpotPrices: () => Promise<void>;
  fetchFee: () => Promise<void>;
  getPoolLiquidity: (tokenToTrade: string, tokenToReceive: string) => Promise<void>;
  sendSwapTransaction: ({ tokenToTrade, tokenToReceive }: any) => Promise<void>;
  fetchTokenPairs: () => Promise<void>;
}

type SwapStore = SwapState & SwapActions;

type SwapSlice = StateCreator<DEXState, [["zustand/devtools", never], ["zustand/immer", never]], [], SwapStore>;

export { SwapActionType };
export type { SwapSlice, SwapStore, SwapState, SwapActions, TransactionState };
