import { BigNumber } from "bignumber.js";
import { TransactionResponse } from "@hashgraph/sdk";
import { StateCreator } from "zustand";
import { DEXState } from "..";
import Long from "long";

enum SwapActionType {
  SEND_SWAP_TRANSACTION_TO_WALLET_STARTED = "swap/SEND_SWAP_TRANSACTION_TO_WALLET_STARTED",
  SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED = "swap/SEND_SWAP_TRANSACTION_TO_WALLET_SUCCEEDED",
  SEND_SWAP_TRANSACTION_TO_WALLET_FAILED = "swap/SEND_SWAP_TRANSACTION_TO_WALLET_FAILED",
  FETCH_POOL_LIQUIDITY_STARTED = "swap/FETCH_POOL_LIQUIDITY_STARTED",
  FETCH_POOL_LIQUIDITY_SUCCEEDED = "swap/FETCH_POOL_LIQUIDITY_SUCCEEDED",
  FETCH_POOL_LIQUIDITY_FAILED = "swap/FETCH_POOL_LIQUIDITY_FAILED",
  SIGN_SWAP_TRANSACTION_STARTED = "swap/SIGN_SWAP_TRANSACTION_STARTED",
  SIGN_SWAP_TRANSACTION_SUCCEEDED = "swap/SIGN_SWAP_TRANSACTION_SUCCEEDED",
  SET_SELECTED_ACCOUNT_ID = "swap/SET_SELECTED_ACCOUNT_ID",
  SET_TOKEN_PAIRS = "swap/SET_TOKEN_PAIRS",
  FETCH_TOKEN_PAIRS_STARTED = "swap/FETCH_TOKEN_PAIRS_STARTED",
  FETCH_TOKEN_PAIRS_SUCCEEDED = "swap/FETCH_TOKEN_PAIRS_SUCCEEDED",
  FETCH_TOKEN_PAIRS_FAILED = "swap/FETCH_TOKEN_PAIRS_FAILED",
  FETCH_PAIR_INFO_STARTED = "swap/FETCH_PAIR_INFO_STARTED",
  FETCH_PAIR_INFO_SUCCEEDED = "swap/FETCH_PAIR_INFO_SUCCEEDED",
  FETCH_PAIR_INFO_FAILED = "swap/FETCH_PAIR_INFO_FAILED",
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
    lpTokenId: string | undefined;
    tokenId: string | undefined;
    fee: BigNumber | undefined;
  };
}
interface TransactionState {
  transactionWaitingToBeSigned: boolean;
  successPayload: TransactionResponse | null;
  errorMessage: string;
}

interface TokenPairInfo {
  precision: BigNumber | undefined;
  fee: BigNumber | undefined;
  spotPrices: Record<string, BigNumber | undefined>;
}

interface SwapState {
  pairInfo: TokenPairInfo;
  poolLiquidity: Record<string, BigNumber | undefined>;
  transactionState: TransactionState;
  errorMessage: string | null;
  tokenPairs: TokenPair[] | null;
}

interface SwapActions {
  fetchPairInfo: (selectedAccountId: string) => Promise<void>;
  getPoolLiquidity: (tokenToTrade: Token, tokenToReceive: Token) => Promise<void>;
  sendSwapTransaction: (
    tokenToTrade: Token,
    slippageTolerance: number,
    transactionDeadline: number,
    tokenToReceiveId: string
  ) => Promise<void>;
  fetchTokenPairs: () => Promise<void>;
}

type SwapStore = SwapState & SwapActions;

type SwapSlice = StateCreator<DEXState, [["zustand/devtools", never], ["zustand/immer", never]], [], SwapStore>;

export { SwapActionType };
export type { SwapSlice, SwapStore, SwapState, SwapActions, TransactionState, TokenPair, Token };
