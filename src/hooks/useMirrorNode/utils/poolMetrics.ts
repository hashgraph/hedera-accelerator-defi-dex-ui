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
 * Calculate the Total Value Locked for a liquidity pool (pTVL).
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
  poolAccountId: string;
  tokenAccountId: string;
  accountTransactions: MirrorNodeTransaction[];
}

const calculateVolume = ({ poolAccountId, tokenAccountId, accountTransactions }: CalculateVolumeParams) => {
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

// TODO
const calculateUserPoolLiquidity = (percentOfPool: number, totalVolumeLocked: number): number => {
  return percentOfPool * totalVolumeLocked;
};

interface CalculatePercentOfPoolParams {
  userTokenBalances: MirrorNodeTokenBalance[];
  poolTokenBalances: MirrorNodeTokenBalance[];
  liquidityTokenAccountId: string;
}

const calculatePercentOfPool = ({
  userTokenBalances,
  poolTokenBalances,
  liquidityTokenAccountId,
}: CalculatePercentOfPoolParams): number => {
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
  poolTokenBalances: MirrorNodeTokenBalance[];
  userTokenBalances: MirrorNodeTokenBalance[];
  tokenPair: TokenPair;
}

const calculateUserPoolMetrics = ({
  poolTokenBalances,
  userTokenBalances,
  tokenPair,
}: CalculateUserPoolMetricsParams): UserPoolState => {
  const { pairToken, tokenA, tokenB } = tokenPair;
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
  poolAccountId: string;
  poolTokenBalances: MirrorNodeTokenBalance[];
  last24Transactions: MirrorNodeTransaction[];
  last7DTransactions: MirrorNodeTransaction[];
  tokenPair: TokenPair;
}

const calculatePoolMetrics = ({
  poolAccountId,
  poolTokenBalances,
  last24Transactions,
  last7DTransactions,
  tokenPair,
}: CalculatePoolMetricsParams): PoolState => {
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
