import { BigNumber } from "bignumber.js";
import {
  calculatePercentOfPool,
  calculateTotalValueLockedForPool,
  calculateUserPoolLiquidity,
  calculateVolume,
} from "../../utils";
import { Pool, UserPool } from "./types";
import { A_B_PAIR_TOKEN_ID, MirrorNodeTokenBalance, MirrorNodeTransaction } from "../../services";

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

interface NewTokenPair {
  tokenA: TokenPairs;
  tokenB: TokenPairs;
  pairToken: {
    symbol: string | undefined
    accountId: string | undefined
  }
}
interface TokenPairs {
  amount: number;
  displayAmount: string;
  balance: number | undefined;
  poolLiquidity: number | undefined;
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairContractId: string | undefined;
    tokenId: string | undefined;
  };
}

interface CalculateUserPoolMetricsParams {
  /** Token balances for the liquidity pool. */
  newCopy: MirrorNodeTokenBalance[];
  /** Token balances for the user's account. */
  userTokenBalances: MirrorNodeTokenBalance[];
  /** A list of liquidity pairs held by a user's account. */
  userTokenPair: NewTokenPair;
  /** The percent (decimal) fee for executing transactions on the pool contract. */
  fee: BigNumber | undefined;
}

/**
 * Calculates metrics related to liquidity pools that a user shares ownership in.
 * @param params - {@link CalculateUserPoolMetricsParams}
 * @returns Metrics related to a liquidity pool that a user has a share in.
 */
const calculateUserPoolMetrics = (params: CalculateUserPoolMetricsParams): UserPool => {
  const { newCopy, userTokenBalances, userTokenPair, fee } = params;
  const { pairToken, tokenA, tokenB } = userTokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    newCopy,
    tokenAAccountId: tokenA.tokenMeta.tokenId ?? "",
    tokenBAccountId: tokenB.tokenMeta.tokenId ?? "",
  });
  /* TODO: Get real LP Amounts for pools */
  const mockedLPPoolTokenBalances = appendLiquidityTokenBalance(newCopy, totalVolumeLocked);
  const percentOfPool = calculatePercentOfPool({
    userTokenBalances,
    poolTokenBalances: mockedLPPoolTokenBalances,
    liquidityTokenAccountId: pairToken.accountId ?? "",
  });
  const userLiquidity = calculateUserPoolLiquidity(percentOfPool, totalVolumeLocked);
  return {
    name: `${tokenA.symbol} - ${tokenB.symbol}`,
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
  newCopy: MirrorNodeTokenBalance[];
  /** Transactions on the liquidity pool for the previous 24 hours */
  last24Transactions: MirrorNodeTransaction[];
  /** Transactions on the liquidity pool for the previous 7 days */
  last7DTransactions: MirrorNodeTransaction[];
  /** A list of liquidity pairs available on the pool contract. */
  tokenPair: NewTokenPair;
  /** The percent (decimal) fee for executing transactions on the pool contract. */
  poolFee: BigNumber | undefined;
}

/**
 * Calculates metrics related to a liquidity pool in the DEX.
 * @param params - {@link CalculatePoolMetricsParams}
 * @returns Metrics related to a liquidity pool.
 */
const calculatePoolMetrics = (params: CalculatePoolMetricsParams): Pool => {
  const { poolAccountId, newCopy, poolFee, last24Transactions, last7DTransactions, tokenPair } = params;
  const { tokenA, tokenB, pairToken } = tokenPair;
  console.log("Roshan new yaha aaya", newCopy);
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    newCopy,
    tokenAAccountId: tokenA.tokenMeta.tokenId ?? "",
    tokenBAccountId: tokenB.tokenMeta.tokenId ?? "",
  });
  const tokenADecimals =
    newCopy.find((tokenBalance) => tokenBalance.token_id === tokenA.tokenMeta.tokenId)?.decimals ?? "0";
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
    name: `${tokenA.symbol} - ${tokenB.symbol}`,
    fee: poolFee,
    totalVolumeLocked,
    past24HoursVolume,
    past7daysVolume,
  };
};

export { calculatePoolMetrics, calculateUserPoolMetrics };
