import { isEmpty, isNil, uniqBy } from "ramda";
import { CONNECT_TO_VIEW, SELECT_TOKEN_TO_VIEW, Token, TokenPair } from "../TokenInput";
import { TokenBalanceJson, AccountBalanceJson } from "@hashgraph/sdk";
import { SwapSettingsInputProps } from "../base";
import { ChangeEvent } from "react";
import { TokenState } from "./types";
import { HBARTokenId } from "../../dex-ui/services";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";
import { formatBigNumberToPercent } from "../../dex-ui/utils";
import { UserPool } from "../../dex-ui/store/poolsSlice";
import { BigNumber } from "bignumber.js";

/**
 * Returns half of the input amount.
 * @param amount - An amount of a tokens.
 * @returns Half of the input amount.
 */
export const halfOf = (amount: number) => amount / 2;

/**
 * Returns the amount of the paired token that is proportionally equal to the
 * token amount based on a given spot price.
 * @param tokenAmount - The amount of a token to exchanged
 * @param spotPrice - The exchange rate for 1 unit of tokenAmount.
 * @returns The amount of an other token that the tokenAmount could be exchanged for.
 */
export const getTokenExchangeAmount = (tokenAmount: number, spotPrice: number | undefined): number => {
  if (spotPrice !== undefined) {
    return Number((tokenAmount * spotPrice).toFixed(8));
  } else {
    console.warn("Spot Price is undefined");
    return 0;
  }
};

/**
 *
 * @param tokenPairs - Array of token Pairs
 * @returns
 */
export const getTokensByUniqueAccountIds = (tokenPairs: TokenPair[]): Token[] => {
  const tokens = tokenPairs.flatMap(({ tokenA, tokenB }: TokenPair) => [tokenA, tokenB]);
  const uniqueTokens = uniqBy((token: Token) => token.tokenMeta.tokenId, tokens);
  return uniqueTokens;
};

/**
 * @param tokenId - Token Account Id
 * @param tokenPairs - - Array of token Pairs
 */
export const getPairedTokens = (tokenId: string, pairAccountId: string, tokenPairs: TokenPair[]): Token[] => {
  const pairedTokens = tokenPairs.reduce<Token[]>((pairedTokens, tokenPair) => {
    const { tokenA, tokenB } = tokenPair;
    if (tokenA.tokenMeta.tokenId === tokenId) {
      return [tokenB, ...pairedTokens];
    }
    if (tokenB.tokenMeta.tokenId === tokenId) {
      return [tokenA, ...pairedTokens];
    }
    return pairedTokens;
  }, []);
  return pairedTokens;
};

export const getTokenData = (tokenId: string, tokenPairs: TokenPair[]) => {
  const token = tokenPairs
    ?.map((token) => {
      if (token.tokenA.tokenMeta.tokenId === tokenId) {
        return token.tokenA;
      } else if (token.tokenB.tokenMeta.tokenId === tokenId) {
        return token.tokenB;
      }
      return undefined;
    })
    .filter((entry) => entry !== undefined)[0];
  return token;
};

interface PairTokenData {
  tokenToTradeData: Token | undefined;
  tokenToReceiveData: Token | undefined;
}

export const getPairedTokenData = (tokenId: string, receiveTokenId: string, tokenPairs: TokenPair[]): PairTokenData => {
  const data = tokenPairs
    ?.map((pair: TokenPair) => {
      if (pair.tokenA.tokenMeta.tokenId === tokenId && pair.tokenB.tokenMeta.tokenId === receiveTokenId) {
        return { tokenToTradeData: pair.tokenA, tokenToReceiveData: pair.tokenB };
      } else if (pair.tokenA.tokenMeta.tokenId === receiveTokenId && pair.tokenB.tokenMeta.tokenId === tokenId) {
        return { tokenToTradeData: pair.tokenB, tokenToReceiveData: pair.tokenA };
      } else {
        return undefined;
      }
    })
    .filter((entry) => entry !== undefined)[0];

  return { tokenToTradeData: data?.tokenToTradeData, tokenToReceiveData: data?.tokenToReceiveData };
};

export const getTokenBalance = (tokenId: string, accountBalances: AccountBalanceJson | null | undefined): number => {
  const balance = isHbarToken(tokenId)
    ? accountBalances?.hbars.replace("ℏ", "") ?? "0.0"
    : accountBalances?.tokens.find((tokenData: TokenBalanceJson) => tokenData.tokenId === tokenId)?.balance ?? "0.0";
  return Number(balance);
};

const isHbarToken = (tokenId: string): boolean => {
  return tokenId === HBARTokenId;
};

interface GetSwapSettingsPropsParams {
  swapSettings: {
    slippage: string;
    transactionDeadline: string;
  };
  onSlippageInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTransactionDeadlineInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const getSwapSettingsProps = ({
  swapSettings,
  onSlippageInputChange,
  onTransactionDeadlineInputChange,
}: GetSwapSettingsPropsParams): { [key: string]: SwapSettingsInputProps } => {
  return {
    slippage: {
      label: "Slippage",
      popoverText: `Slippage refers to the difference between the expected 
  price of a trade and the price at which the trade is executed.`,
      inputUnit: "%",
      onInputChange: onSlippageInputChange,
      value: swapSettings.slippage,
    },
    transactionDeadline: {
      label: "Transaction Deadline",
      popoverText: `If your transaction is not completed within the deadline, it will revert and your coins
  (less the fee) will be returned to you.`,
      inputUnit: "min",
      onInputChange: onTransactionDeadlineInputChange,
      value: swapSettings.transactionDeadline,
    },
  };
};

interface GetExchangeRateDisplayParams {
  spotPrice: number | undefined;
  tokenToTradeSymbol: string | undefined;
  tokenToReceiveSymbol: string | undefined;
}

export const getExchangeRateDisplay = ({
  spotPrice,
  tokenToTradeSymbol,
  tokenToReceiveSymbol,
}: GetExchangeRateDisplayParams) => {
  if (spotPrice === undefined || tokenToTradeSymbol === undefined || tokenToReceiveSymbol === undefined) {
    return "--";
  }
  return `${spotPrice?.toFixed(8)} ${tokenToReceiveSymbol}`;
};

interface CalculateLiquidityAfterSwap {
  tokenToTradeAmount: number;
  tokenToTradeLiquidity: number;
  tokenToReceiveLiquidity: number;
}

export const calculateLiquidityAfterSwap = ({
  tokenToTradeAmount,
  tokenToTradeLiquidity,
  tokenToReceiveLiquidity,
}: CalculateLiquidityAfterSwap): BigNumber => {
  if (tokenToTradeLiquidity <= 0 || tokenToReceiveLiquidity <= 0) {
    return BigNumber(0);
  }
  if (isNil(tokenToTradeAmount) || tokenToTradeAmount <= 0) {
    return BigNumber(0);
  }
  const constantProduct = BigNumber(tokenToTradeLiquidity).times(tokenToReceiveLiquidity);
  const tokenToTradeLiquidityAfterSwap = tokenToTradeLiquidity + tokenToTradeAmount; //+fee
  const tokenToReceiveLiquidityAfterSwap = constantProduct.div(tokenToTradeLiquidityAfterSwap);
  return tokenToReceiveLiquidityAfterSwap;
};

interface CalculateTokenAmountToReceive {
  tokenToTradeAmount: number;
  tokenToTradeLiquidity: number;
  tokenToReceiveLiquidity: number;
}
/**
 * Calculates the token to receive amount based on the tokenToTradeAmount input.
 * Follows the x*y=K formula where x and y are the amounts of each token's liquidity.
 * K remains constant after a transaction, so it is safe to assume (post trade)
 * newX*newY = K. Therefore, taking the tokenToTradeAmount and adding it to the current
 * liquidity of the tokenToTrade in the pool, we get "newX". Taking k/newX, we can compute
 * newY. We then subtract the newY from the current liquidty of Y to get the tokenToReceive amount
 */
export const calculateTokenAmountToReceive = ({
  tokenToTradeAmount,
  tokenToTradeLiquidity,
  tokenToReceiveLiquidity,
}: CalculateTokenAmountToReceive): BigNumber => {
  if (tokenToTradeAmount <= 0) {
    return BigNumber(0);
  }
  const tokenToReceiveLiquidityAfterSwap = calculateLiquidityAfterSwap({
    tokenToTradeAmount,
    tokenToTradeLiquidity,
    tokenToReceiveLiquidity,
  });
  const amountToReceive = BigNumber(tokenToReceiveLiquidity).minus(tokenToReceiveLiquidityAfterSwap);
  return amountToReceive;
};
interface GetSpotPriceParams {
  spotPrices: Record<string, number | undefined>;
  tokenToTrade: TokenState;
  tokenToReceive: TokenState;
}

export function getSpotPrice(params: GetSpotPriceParams): number | undefined {
  if (isEmpty(params.spotPrices)) {
    return undefined;
  }
  /**
   * TODO: Token Id strings should be directly passed into the function
   * instead of accepting the full TokenState.
   */
  const tokenToTradeId = params.tokenToTrade.tokenMeta.tokenId || "";
  const tokenToReceiveId = params.tokenToReceive.tokenMeta.tokenId || "";
  const route = `${tokenToTradeId}=>${tokenToReceiveId}`;
  if (params.spotPrices?.[route] !== undefined) {
    return params.spotPrices[route] ?? 0;
  }
}

interface CalculatePriceImpactParams {
  tokenToTrade: {
    tokenId: string;
    amount: number;
    poolLiquidity: number;
  };
  tokenToReceive: {
    tokenId: string;
    poolLiquidity: number;
  };
}

/**
 * Calculates price impact given the token input amount and pool sizes.
 *
 */
export const calculatePriceImpact = ({ tokenToTrade, tokenToReceive }: CalculatePriceImpactParams) => {
  if (
    tokenToTrade.poolLiquidity <= 0 ||
    tokenToReceive.poolLiquidity <= 0 ||
    tokenToTrade.amount <= 0 ||
    tokenToTrade.tokenId === tokenToReceive.tokenId
  ) {
    return 0;
  }
  /** TODO: Incorporate fees into price impact calculation. */
  const amountInWithFees = tokenToTrade.amount;
  const tokenAmountToReceive = calculateTokenAmountToReceive({
    tokenToTradeAmount: amountInWithFees,
    tokenToTradeLiquidity: tokenToTrade.poolLiquidity,
    tokenToReceiveLiquidity: tokenToReceive.poolLiquidity,
  });
  if (tokenAmountToReceive.lte(0)) {
    return 0;
  }
  const newSpotPrice = BigNumber(amountInWithFees).div(tokenAmountToReceive);
  const currentSpotPrice = BigNumber(tokenToTrade.poolLiquidity).div(tokenToReceive.poolLiquidity);
  const priceImpact = BigNumber(1).minus(currentSpotPrice.div(newSpotPrice));
  return priceImpact.shiftedBy(2).toNumber();
};

export const getTradeTokenMeta = (
  tokenId: string | undefined,
  pairAccountId: string | undefined,
  tokenPairs: TokenPair[] = []
): Token | undefined => {
  const filterToken = tokenPairs
    ?.map((token) => {
      if (token.tokenA.tokenMeta.pairAccountId === pairAccountId && token.tokenA.tokenMeta.tokenId === tokenId) {
        return token.tokenB;
      } else if (token.tokenB.tokenMeta.pairAccountId === pairAccountId && token.tokenB.tokenMeta.tokenId === tokenId) {
        return token.tokenA;
      }
      return undefined;
    })
    .filter((entry) => entry !== undefined)[0];

  return filterToken;
};

export const getDefaultTokenMeta = { pairAccountId: undefined, tokenId: undefined };

export function getPoolLiquidityForTokenId(tokenId: string, poolLiquidity: Record<string, number | undefined>) {
  return poolLiquidity?.[tokenId];
}

interface FormatTokenBalanceParams {
  symbol: string;
  balance: number;
  walletConnectionStatus: HashConnectConnectionState;
}

export function formatTokenBalance(params: FormatTokenBalanceParams): string {
  if (params.walletConnectionStatus !== HashConnectConnectionState.Paired) {
    return CONNECT_TO_VIEW;
  }
  if (params.symbol === undefined || params.symbol === "") {
    return SELECT_TOKEN_TO_VIEW;
  }
  return String(params.balance);
}

export function calculatePoolRatio(firstTokenSymbol: string, secondTokenSymbol: string, userPoolsMetrics: UserPool[]) {
  const poolSymbol = `${firstTokenSymbol}-${secondTokenSymbol}`;
  const poolSymbolReverse = `${secondTokenSymbol}-${firstTokenSymbol}`;
  const poolPercentage = userPoolsMetrics.find(
    (pool) => pool.name === poolSymbol || pool.name === poolSymbolReverse
  )?.percentOfPool;
  return formatBigNumberToPercent(poolPercentage);
}
