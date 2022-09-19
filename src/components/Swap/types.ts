export interface SwapState {
  tokenToTrade: {
    symbol: string | undefined;
    amount: number;
    balance: number | undefined;
    poolLiquidity: number | undefined;
  };
  tokenToReceive: {
    symbol: string | undefined;
    amount: number;
    balance: number | undefined;
    poolLiquidity: number | undefined;
  };
  spotPrice: number | undefined;
}

export enum formulaTypes {
  MAX = "MAX",
  HALF = "HALF",
}
