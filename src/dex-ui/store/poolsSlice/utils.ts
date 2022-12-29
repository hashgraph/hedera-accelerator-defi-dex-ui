import { BigNumber } from "bignumber.js";
import {
  calculateTotalValueLockedForPool,
  calculateUserPoolLiquidity,
  calculateVolume,
  calculatePercentOfPoolFromTotalSupply,
} from "../../utils";
import { Pool, UserPool, TokenPair } from "./types";
import { MirrorNodeTokenBalance, MirrorNodeTransaction } from "../../services";

/**
 * TODO: This is mocked data that adds a token pair balance to the primary pool balance data.
 * This should be removed after we can fetch pair tokens from the pool contract.
 * */
/* const appendLiquidityTokenBalance = (poolTokenBalances: MirrorNodeTokenBalance[], mockLPbalance: BigNumber) => {
  const mockedTokenBalance = {
    token_id: A_B_PAIR_TOKEN_ID,
    balance: BigNumber(mockLPbalance),
    decimals: "8",
    accountId: "",
  };
  return poolTokenBalances?.concat(mockedTokenBalance);
}; */

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
  const { tokenA, tokenB } = userTokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolTokenBalances,
    tokenAAccountId: tokenA.tokenMeta.tokenId ?? "",
    tokenBAccountId: tokenB.tokenMeta.tokenId ?? "",
  });
  /* TODO: Get real LP Amounts for pools */
  // const mockedLPPoolTokenBalances = appendLiquidityTokenBalance(poolTokenBalances, totalVolumeLocked);
  // const percentOfPool = calculatePercentOfPool({
  //   userTokenBalances,
  //   poolTokenBalances: mockedLPPoolTokenBalances,
  //   liquidityTokenAccountId: pairToken.pairLpAccountId ?? "",
  // });
  const percentOfPool = calculatePercentOfPoolFromTotalSupply({
    userTokenBalances,
    tokenPair: userTokenPair,
  });
  const userLiquidity = calculateUserPoolLiquidity(percentOfPool, totalVolumeLocked);
  return {
    name: `${tokenA.symbol}${tokenB.symbol}`,
    fee,
    liquidity: userLiquidity,
    percentOfPool,
    unclaimedFees: BigNumber(0),
    userTokenPair,
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
    tokenAAccountId: tokenA.tokenMeta.tokenId ?? "",
    tokenBAccountId: tokenB.tokenMeta.tokenId ?? "",
  });
  const tokenADecimals =
    poolTokenBalances.find((tokenBalance) => tokenBalance.token_id === tokenA.tokenMeta.tokenId)?.decimals ?? "0";
  const past24HoursVolume = calculateVolume({
    poolAccountId,
    tokenAccountId: tokenA.tokenMeta.tokenId ?? "",
    tokenDecimals: tokenADecimals,
    accountTransactions: last24Transactions,
  });
  const past7daysVolume = calculateVolume({
    poolAccountId,
    tokenAccountId: tokenA.tokenMeta.tokenId ?? "",
    tokenDecimals: tokenADecimals,
    accountTransactions: last7DTransactions,
  });
  return {
    name: `${tokenA.symbol}${tokenB.symbol}`,
    fee: poolFee,
    totalVolumeLocked,
    past24HoursVolume,
    past7daysVolume,
  };
};

export { calculatePoolMetrics, calculateUserPoolMetrics };
