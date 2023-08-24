import BigNumber from "bignumber.js";
import Long from "long";

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
    fee: BigNumber | undefined;
    lpTokenId: string | undefined;
  };
}

export interface LPTokenState {
  amount: number;
  displayAmount: string;
}
