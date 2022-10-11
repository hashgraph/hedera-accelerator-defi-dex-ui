import { isNil } from "ramda";
import {
  MirrorNodeTransaction,
  PoolState,
  TokenPair,
  MirrorNodeTokenTransfer,
  UserPoolState,
  MirrorNodeTokenBalance,
  MirrorNodeAccountBalance,
} from "../types";
import { getTimestamp24HoursAgo } from "./time";

// TODO: Need to get token coversion rate from USDC_TOKEN_ID
const getValueInUSD = (/* tokenAccountId */): number => 1;

/**
 * Gathers all transaction data that has a consensus timestamp from the past 24 hours.
 * @param transactions - A list of Hedera transactions.
 * @returns A list of Hedera transactions in the transactions list that happened in the past 24 hours.
 */
const getTransactionsFromLast24Hours = (transactions: MirrorNodeTransaction[]) => {
  const timestamp24HoursAgo = getTimestamp24HoursAgo();
  return transactions.filter(
    (transaction: MirrorNodeTransaction) => transaction.consensus_timestamp > timestamp24HoursAgo
  );
};

/**
 * Retrieves the balance for a specified token in a list of token balances
 * @param tokenBalances - A list of token IDs and balances.
 * @param tokenId - The ID of the token to get the balance for.
 * @returns The balance for the token with an ID equal to the tokenId.
 */
const getTokenBalance = (tokenBalances: MirrorNodeTokenBalance[], tokenId: string) => {
  return tokenBalances?.find((tokenBalance) => tokenBalance.token_id === tokenId)?.balance;
};

/**
 * Retrieves the token balances for a specified account in a list of account balances.
 * @param accountBalances - A list of account balances.
 * @param accountId - The ID of the account to get the token balance for.
 * @returns The token balances for the account equal to the accountId.
 */
const getTokenBalances = (accountBalances: MirrorNodeAccountBalance[], accountId: string) => {
  return accountBalances?.find((accountBalance) => accountBalance.account === accountId)?.tokens ?? [];
};

interface CalculateTotalValueLockedForPoolParams {
  /** Token balances for the liquidity pool. */
  poolTokenBalances: MirrorNodeTokenBalance[];
  /** Account ID for Token A. */
  tokenAAccountId: string;
  /** Account ID for Token B. */
  tokenBAccountId: string;
}

/**
 * Calculates the Total Value Locked for a liquidity pool (pTVL).
 * A = reserve balance of tokenA in pool
 * B = reserve balance of tokenB in pool
 * vA = value of 1 tokenA in USD
 * vB = value of 1 tokenB in USD
 * pTVL = (A * vA) + (B * vB)
 * @param params - {@link CalculateTotalValueLockedForPoolParams}
 * @returns The total value locked for a given pair of tokens.
 */
const calculateTotalValueLockedForPool = (params: CalculateTotalValueLockedForPoolParams): number => {
  const { poolTokenBalances, tokenAAccountId, tokenBAccountId } = params;
  const tokenAPoolBalance = getTokenBalance(poolTokenBalances, tokenAAccountId);
  const tokenBPoolBalance = getTokenBalance(poolTokenBalances, tokenBAccountId);
  if (isNil(tokenAPoolBalance) || isNil(tokenBPoolBalance)) {
    console.error("Cannot find mirror node balance for token account ID.");
    return 0;
  } else {
    const tokenAPoolBalanceInUSD = getValueInUSD();
    const tokenBPoolBalanceInUSD = getValueInUSD();
    return tokenAPoolBalance * tokenAPoolBalanceInUSD + tokenBPoolBalance * tokenBPoolBalanceInUSD;
  }
};

interface CalculateVolumeParams {
  /** Account ID of the liquidity pool. */
  poolAccountId: string;
  /**
   * The aggregate amount of tokens credited or debited in the liquidity pool with this token ID
   * result in the transaction volume for a pool.
   */
  tokenAccountId: string;
  /**
   * Transactions that are associated with a credit or debit in the liquidity pool. The list of
   * transactions should be filtered to fit the desired consensus timestamp range.
   * */
  accountTransactions: MirrorNodeTransaction[];
}

/**
 * Calculates the transaction volume of a token with a specified account ID in the given list
 * of account transactions.
 * A = for a given pool, the amount of tokenA swapped in a given hour h
 * vA = the value in USD for 1 tokenA at the end of hour h
 * Volume at hour h = A * vA
 * @param params - {@link CalculateVolumeParams}
 * @returns The transaction volume of the token with tokenAccountId in the accountTransactions.
 */
const calculateVolume = (params: CalculateVolumeParams) => {
  const { poolAccountId, tokenAccountId, accountTransactions } = params;
  const allTokenTransfers = accountTransactions.flatMap((accountTransaction) => accountTransaction.token_transfers);
  const volume = allTokenTransfers.reduce((tokenTransactionVolume: number, tokenTransfer: MirrorNodeTokenTransfer) => {
    const { token_id, account, amount } = tokenTransfer;
    if (account === poolAccountId && token_id === tokenAccountId) {
      return tokenTransactionVolume + Math.abs(amount);
    }
    return tokenTransactionVolume;
  }, 0);
  return volume * getValueInUSD();
};

/**
 * Calculates the value of an account's portion of a liquidity pool.
 * m% = Percent of pool
 * pTVL = Totoal Value Locked for pool
 * mL = m% * pTVL
 * @param percentOfPool - The percentage of the pool owned by an account.
 * @param totalValueLocked - The total value in USD locked in the liquidity pool.
 * @returns The value of the account's porition of the liquidity pool in USD.
 */
const calculateUserPoolLiquidity = (percentOfPool: number, totalValueLocked: number): number => {
  return percentOfPool * totalValueLocked;
};

interface CalculatePercentOfPoolParams {
  /** Token types and balances owned by the user's account. */
  userTokenBalances: MirrorNodeTokenBalance[];
  /** Token types and balances owned by the liquidity pool account. */
  poolTokenBalances: MirrorNodeTokenBalance[];
  /** Account ID of the liquidity pool. */
  liquidityTokenAccountId: string;
}

/**
 * Calculates the percentage in decimal format of the pool owned by an account.
 * mLP = My LP tokens for a pool
 * aLP = Total LP tokens for a pool
 * m = mLP/aLP
 * @param params - {@link CalculatePercentOfPoolParams}
 * @returns The percentage (decimal) of the pool owned by an account.
 */
const calculatePercentOfPool = (params: CalculatePercentOfPoolParams): number => {
  const { userTokenBalances, poolTokenBalances, liquidityTokenAccountId } = params;
  const poolLPTokenBalance = getTokenBalance(poolTokenBalances, liquidityTokenAccountId);
  const userLPTokenBalance = getTokenBalance(userTokenBalances, liquidityTokenAccountId);
  if (isNil(poolLPTokenBalance) || isNil(userLPTokenBalance)) {
    console.error("Cannot find mirror node balance for LP token account ID.");
    return 0;
  } else {
    return userLPTokenBalance / poolLPTokenBalance;
  }
};

interface CalculateUserPoolMetricsParams {
  /** Token balances for the liquidity pool. */
  poolTokenBalances: MirrorNodeTokenBalance[];
  /** Token balances for the user's account. */
  userTokenBalances: MirrorNodeTokenBalance[];
  /** A list of liquidity pairs held by a user's account. */
  userTokenPair: TokenPair;
}

/**
 * Calculates metrics related to liquidity pools that a user shares ownership in.
 * @param params - {@link CalculateUserPoolMetricsParams}
 * @returns Metrics related to a liquidity pool that a user has a share in.
 */
const calculateUserPoolMetrics = (params: CalculateUserPoolMetricsParams): UserPoolState => {
  const { poolTokenBalances, userTokenBalances, userTokenPair } = params;
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
    fee: 0.05,
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
}

/**
 * Calculates metrics related to a liquidity pool in the DEX.
 * @param params - {@link CalculatePoolMetricsParams}
 * @returns Metrics related to a liquidity pool.
 */
const calculatePoolMetrics = (params: CalculatePoolMetricsParams): PoolState => {
  const { poolAccountId, poolTokenBalances, last24Transactions, last7DTransactions, tokenPair } = params;
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
    fee: 0.05,
    totalVolumeLocked,
    past24HoursVolume,
    past7daysVolume,
  };
};

export { calculatePoolMetrics, calculateUserPoolMetrics, getTokenBalances, getTransactionsFromLast24Hours };
