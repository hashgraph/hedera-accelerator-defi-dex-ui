import { BigNumber } from "bignumber.js";
import {
  calculateTotalValueLockedForPool,
  calculateUserPoolLiquidity,
  calculateVolume,
  calculatePercentOfPoolFromTotalSupply,
  isHbarToken,
} from "../../utils";
import { Pool, UserPool, TokenPair } from "./types";
import { MirrorNodeAccountBalance, MirrorNodeTokenBalance, MirrorNodeTransaction } from "../../services";

interface CalculateUserPoolMetricsParams {
  /** Token balances for the liquidity pool. */
  poolTokenBalances: MirrorNodeAccountBalance;
  /** Token balances for the user's account. */
  userTokenBalances: MirrorNodeAccountBalance;
  /** A list of liquidity pairs held by a user's account. */
  userTokenPair: TokenPair;
  /** The percent (decimal) fee for executing transactions on the pool contract. */
  fee: BigNumber | undefined;
}

/**
 * Calculates metrics related to liquidity pools that a user shares ownership in.
 * @param params - {@link CalculateUserPoolMetricsParams}
 * @returns Metrics related to a liquidity pool that a user has a share in.
 */
const calculateUserPoolMetrics = (params: CalculateUserPoolMetricsParams): UserPool => {
  const { poolTokenBalances, userTokenBalances, userTokenPair, fee } = params;
  const { tokenA, tokenB, lpTokenMeta } = userTokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolTokenBalances,
    tokenAAccountId: tokenA.tokenMeta.tokenId ?? "",
    tokenBAccountId: tokenB.tokenMeta.tokenId ?? "",
  });

  const percentOfPool = calculatePercentOfPoolFromTotalSupply({
    userTokenBalances,
    tokenPair: userTokenPair,
  });
  const userLiquidity = calculateUserPoolLiquidity(percentOfPool, totalVolumeLocked);
  return {
    name: lpTokenMeta.symbol ?? `${tokenA.symbol}-${tokenB.symbol}`,
    fee,
    liquidity: userLiquidity,
    percentOfPool,
    unclaimedFees: BigNumber(0),
    userTokenPair,
  };
};

function getTokenDecimals(poolBalances: MirrorNodeAccountBalance, tokenAId: string, tokenBId: string): string {
  const defaultDecimals = "0";
  /**
   * HBAR swap transactions are not appearing in the MirrorNode API transaction history calls. The current
   * workaround is to use the tokenB balances to calculate pool metrics. There may be an alternative solution
   * to read HBAR transactions from the API.
   */
  if (isHbarToken(tokenAId)) {
    const tokenBBalance = poolBalances.tokens?.find(
      (tokenBalance: MirrorNodeTokenBalance) => tokenBalance.token_id === tokenBId
    );
    return tokenBBalance?.decimals ?? defaultDecimals;
  }
  const tokenABalance = poolBalances.tokens?.find(
    (tokenBalance: MirrorNodeTokenBalance) => tokenBalance.token_id === tokenAId
  );
  return tokenABalance?.decimals ?? defaultDecimals;
}

interface CalculatePoolMetricsParams {
  /** Account ID of a liquidity pool. */
  poolAccountId: string;
  /** Token balances for the liquidity pool. */
  poolTokenBalances: MirrorNodeAccountBalance;
  /** Transactions on the liquidity pool for the previous 24 hours */
  last24Transactions: MirrorNodeTransaction[];
  /** Transactions on the liquidity pool for the previous 7 days */
  last7DTransactions: MirrorNodeTransaction[];
  /** A list of liquidity pairs available on the pool contract. */
  tokenPair: TokenPair;
  /** The percent (decimal) fee for executing transactions on the pool contract. */
  poolFee: BigNumber | undefined;
}

/**
 * Calculates metrics related to a liquidity pool in the DEX.
 * @param params - {@link CalculatePoolMetricsParams}
 * @returns Metrics related to a liquidity pool.
 */
const calculatePoolMetrics = (params: CalculatePoolMetricsParams): Pool => {
  const { poolAccountId, poolTokenBalances, poolFee, last24Transactions, last7DTransactions, tokenPair } = params;
  const { tokenA, tokenB, lpTokenMeta } = tokenPair;
  const tokenAId = tokenA.tokenMeta.tokenId ?? "";
  const tokenBId = tokenB.tokenMeta.tokenId ?? "";
  const tokenADecimals = getTokenDecimals(poolTokenBalances, tokenAId, tokenBId);
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolTokenBalances,
    tokenAAccountId: tokenAId,
    tokenBAccountId: tokenBId,
  });
  const past24HoursVolume = calculateVolume({
    poolAccountId,
    tokenAccountId: isHbarToken(tokenAId) ? tokenBId : tokenAId,
    tokenDecimals: tokenADecimals,
    accountTransactions: last24Transactions,
  });
  const past7daysVolume = calculateVolume({
    poolAccountId,
    tokenAccountId: isHbarToken(tokenAId) ? tokenBId : tokenAId,
    tokenDecimals: tokenADecimals,
    accountTransactions: last7DTransactions,
  });
  return {
    name: lpTokenMeta.symbol ?? `${tokenA.symbol}-${tokenB.symbol}`,
    fee: poolFee,
    totalVolumeLocked,
    past24HoursVolume,
    tokensId: `${tokenAId}-${tokenBId}`,
    past7daysVolume,
    pairAccountId: tokenA.tokenMeta.pairAccountId,
  };
};

export { calculatePoolMetrics, calculateUserPoolMetrics };
