import BigNumber from "bignumber.js";

export enum SwapMutations {
  GetSwapPair = "getSwapPair",
}

export enum SwapQueries {
  GetPairInfo = "getPairInfo",
}

export interface PairDataResponse {
  pair: string;
  token: string;
  swappedQty: BigNumber;
  fee: BigNumber;
  slippage: BigNumber;
}

export interface PairInfoResponse {
  tokenATokenId: string;
  tokenBTokenId: string;
  tokenASpotPrice: BigNumber;
  tokenBSpotPrice: BigNumber;
  precision: BigNumber;
  feeWithPrecision: BigNumber;
}
