export enum formulaTypes {
  MAX = "MAX",
  HALF = "HALF",
}

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

export interface LPTokenState {
  tokenSymbol: string | undefined;
  userLpAmount: number | undefined;
  userLpPercentage: string | undefined;
  pairAccountId: string | undefined;
  lpAccountId: string | undefined;
  amount: number;
  fee: string;
  displayAmount: string;
}
