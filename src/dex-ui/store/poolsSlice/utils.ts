import {
  calculatePercentOfPool,
  calculateTotalValueLockedForPool,
  calculateUserPoolLiquidity,
  calculateVolume,
} from "../../utils";
import { PoolState, UserPoolState } from "./types";
import { MirrorNodeTokenBalance, MirrorNodeTransaction, TokenPair } from "../../services";

interface CalculateUserPoolMetricsParams {
  /** Token balances for the liquidity pool. */
  poolTokenBalances: MirrorNodeTokenBalance[];
  /** Token balances for the user's account. */
  userTokenBalances: MirrorNodeTokenBalance[];
  /** A list of liquidity pairs held by a user's account. */
  userTokenPair: TokenPair;
  /** The percent (decimal) fee for executing transactions on the pool contract. */
  fee: number | undefined;
}

/**
 * Calculates metrics related to liquidity pools that a user shares ownership in.
 * @param params - {@link CalculateUserPoolMetricsParams}
 * @returns Metrics related to a liquidity pool that a user has a share in.
 */
const calculateUserPoolMetrics = (params: CalculateUserPoolMetricsParams): UserPoolState => {
  const { poolTokenBalances, userTokenBalances, userTokenPair, fee } = params;
  const { pairToken, tokenA, tokenB } = userTokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolTokenBalances,
    tokenAAccountId: tokenA.accountId,
    tokenBAccountId: tokenB.accountId,
  });
  const percentOfPool = calculatePercentOfPool({
    userTokenBalances,
    poolTokenBalances,
    liquidityTokenAccountId: pairToken.accountId,
  });
  const userLiquidity = calculateUserPoolLiquidity(percentOfPool, totalVolumeLocked);
  return {
    name: `${tokenA.symbol}/${tokenB.symbol}`,
    fee,
    liquidity: userLiquidity,
    percentOfPool,
    unclaimedFees: 0,
  };
};

interface CalculatePoolMetricsParams {
  /** Account ID of a liquidity pool. */
  poolAccountId: string;
  /** Token balances for the liquidity pool. */
  poolTokenBalances: MirrorNodeTokenBalance[];
  /** Transactions on the liquidity pool for the previous 24 hours */
  last24Transactions: MirrorNodeTransaction[];
  /** Transactions on the liquidity pool for the previous 7 days */
  last7DTransactions: MirrorNodeTransaction[];
  /** A list of liquidity pairs available on the pool contract. */
  tokenPair: TokenPair;
  /** The percent (decimal) fee for executing transactions on the pool contract. */
  poolFee: number | undefined;
}

/**
 * Calculates metrics related to a liquidity pool in the DEX.
 * @param params - {@link CalculatePoolMetricsParams}
 * @returns Metrics related to a liquidity pool.
 */
const calculatePoolMetrics = (params: CalculatePoolMetricsParams): PoolState => {
  const { poolAccountId, poolTokenBalances, poolFee, last24Transactions, last7DTransactions, tokenPair } = params;
  const { tokenA, tokenB } = tokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolTokenBalances,
    tokenAAccountId: tokenA.accountId,
    tokenBAccountId: tokenB.accountId,
  });
  const past24HoursVolume = calculateVolume({
    poolAccountId,
    tokenAccountId: tokenA.accountId,
    accountTransactions: last24Transactions,
  });
  const past7daysVolume = calculateVolume({
    poolAccountId,
    tokenAccountId: tokenA.accountId,
    accountTransactions: last7DTransactions,
  });
  return {
    name: `${tokenA.symbol}/${tokenB.symbol}`,
    fee: poolFee,
    totalVolumeLocked,
    past24HoursVolume,
    past7daysVolume,
  };
};

export { calculatePoolMetrics, calculateUserPoolMetrics };
