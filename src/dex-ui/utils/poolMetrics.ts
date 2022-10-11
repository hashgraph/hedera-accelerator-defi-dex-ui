import { isNil } from "ramda";
import {
  MirrorNodeTransaction,
  MirrorNodeTokenTransfer,
  MirrorNodeTokenBalance,
} from "../services/MirrorNodeService/types";
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

export {
  calculateTotalValueLockedForPool,
  calculateVolume,
  calculatePercentOfPool,
  calculateUserPoolLiquidity,
  getTransactionsFromLast24Hours,
};
