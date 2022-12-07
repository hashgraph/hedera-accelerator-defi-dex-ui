export interface TokenState {
  symbol: string | undefined;
  amount: number;
  displayAmount: string;
  balance: number | undefined;
  poolLiquidity: number | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairAccountId: string | undefined;
    tokenId: string | undefined;
  };
}
export interface SwapTokensState {
  tokenToTrade: TokenState;
  tokenToReceive: TokenState;
  swapSettings: {
    slippage: string;
    transactionDeadline: string;
  };
  spotPrice: number | undefined;
}
export interface Token {
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
  };
}
export interface TokenPair {
  tokenA: Token;
  tokenB: Token;
  pairToken: {
    symbol: string | undefined;
    pairLpAccountId: string | undefined;
    totalSupply?: Long | null;
    decimals: number;
  };
}

export enum formulaTypes {
  MAX = "MAX",
  HALF = "HALF",
}
