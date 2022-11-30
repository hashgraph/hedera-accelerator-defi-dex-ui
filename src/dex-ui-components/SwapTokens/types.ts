export interface SwapTokensState {
  tokenToTrade: {
    symbol: string | undefined;
    amount: number;
    displayAmount: string;
    balance: number | undefined;
    poolLiquidity: number | undefined;
    tokenName: string | undefined;
    totalSupply: Long | null;
    maxSupply: Long | null;
    tokenMeta: {
      pairContractId: string | undefined;
      tokenId: string | undefined;
    }
  };
  tokenToReceive: {
    symbol: string | undefined;
    amount: number;
    displayAmount: string;
    balance: number | undefined;
    poolLiquidity: number | undefined;
    tokenName: string | undefined;
    totalSupply: Long | null;
    maxSupply: Long | null;
    tokenMeta: {
      pairContractId: string | undefined;
      tokenId: string | undefined;
    }
  };
  swapSettings: {
    slippage: string;
    transactionDeadline: string;
  };
  spotPrice: number | undefined;
}

export enum formulaTypes {
  MAX = "MAX",
  HALF = "HALF",
}
