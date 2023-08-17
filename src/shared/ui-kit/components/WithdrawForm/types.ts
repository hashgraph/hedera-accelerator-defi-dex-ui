export interface LPTokenDetails {
  tokenSymbol: string;
  userLpAmount: number;
  userLpPercentage: string;
  lpAccountId: string;
  pairAccountId: string;
  unclaimedFees: string;
  fee: string;
}

export interface TokenLiquidityDetails {
  tokenSymbol: string;
  poolLiquidity: number;
  userProvidedLiquidity: number;
}

export interface PoolLiquidityDetails {
  firstToken: TokenLiquidityDetails;
  secondToken: TokenLiquidityDetails;
}
