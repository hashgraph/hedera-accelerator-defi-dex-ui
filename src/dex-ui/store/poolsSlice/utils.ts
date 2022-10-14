import { BigNumber } from "bignumber.js";
import {
  calculatePercentOfPool,
  calculateTotalValueLockedForPool,
  calculateUserPoolLiquidity,
  calculateVolume,
} from "../../utils";
import { Pool, UserPool } from "./types";
import { A_B_PAIR_TOKEN_ID, MirrorNodeTokenBalance, MirrorNodeTransaction, TokenPair } from "../../services";

/**
 * TODO: This is mocked data that adds a token pair balance to the primary pool balance data.
 * This should be removed after we can fetch pair tokens from the pool contract.
 * */
const appendLiquidityTokenBalance = (poolTokenBalances: MirrorNodeTokenBalance[], mockLPbalance: BigNumber) => {
  const mockedTokenBalance = {
    token_id: A_B_PAIR_TOKEN_ID,
    balance: BigNumber(mockLPbalance),
    decimals: "8",
  };
  return poolTokenBalances?.concat(mockedTokenBalance);
};

interface CalculateUserPoolMetricsParams {
  /** Token balances for the liquidity pool. */
  poolTokenBalances: MirrorNodeTokenBalance[];
  /** Token balances for the user's account. */
  userTokenBalances: MirrorNodeTokenBalance[];
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
  const { pairToken, tokenA, tokenB } = userTokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolTokenBalances,
    tokenAAccountId: tokenA.accountId,
    tokenBAccountId: tokenB.accountId,
  });
  /* TODO: Get real LP Amounts for pools */
  const mockedLPPoolTokenBalances = appendLiquidityTokenBalance(poolTokenBalances, totalVolumeLocked);
  const percentOfPool = calculatePercentOfPool({
    userTokenBalances,
    poolTokenBalances: mockedLPPoolTokenBalances,
    liquidityTokenAccountId: pairToken.accountId,
  });
  const userLiquidity = calculateUserPoolLiquidity(percentOfPool, totalVolumeLocked);
  return {
    name: `${tokenA.symbol}/${tokenB.symbol}`,
    fee,
    liquidity: userLiquidity,
    percentOfPool,
    unclaimedFees: BigNumber(0),
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
  poolFee: BigNumber | undefined;
}

/**
 * Calculates metrics related to a liquidity pool in the DEX.
 * @param params - {@link CalculatePoolMetricsParams}
 * @returns Metrics related to a liquidity pool.
 */
const calculatePoolMetrics = (params: CalculatePoolMetricsParams): Pool => {
  const { poolAccountId, poolTokenBalances, poolFee, last24Transactions, last7DTransactions, tokenPair } = params;
  const { tokenA, tokenB } = tokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolTokenBalances,
    tokenAAccountId: tokenA.accountId,
    tokenBAccountId: tokenB.accountId,
  });
  const tokenADecimals =
    poolTokenBalances.find((tokenBalance) => tokenBalance.token_id === tokenA.accountId)?.decimals ?? "0";
  const past24HoursVolume = calculateVolume({
    poolAccountId,
    tokenAccountId: tokenA.accountId,
    tokenDecimals: tokenADecimals,
    accountTransactions: last24Transactions,
  });
  const past7daysVolume = calculateVolume({
    poolAccountId,
    tokenAccountId: tokenA.accountId,
    tokenDecimals: tokenADecimals,
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
