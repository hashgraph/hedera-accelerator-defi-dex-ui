import { BigNumber } from "bignumber.js";
import { isNil } from "ramda";
import { MirrorNodeTransaction, MirrorNodeTokenTransfer, MirrorNodeAccountBalance } from "@shared/services";
import { TokenPair } from "@dex/store/poolsSlice";
import { getTimestamp24HoursAgo } from "./time";
import { HBARTokenId } from "@dex/services";
import { getTransactionFeeRateDisplay } from "@shared/utils";
import { ethers } from "ethers";

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
const getTokenBalance = (tokenBalances: MirrorNodeAccountBalance, tokenId: string) => {
  return isHbarToken(tokenId)
    ? tokenBalances.balance
    : tokenBalances?.tokens?.find((tokenBalance) => tokenBalance.token_id === tokenId)?.balance;
};

// TODO: Remove this method once the backend resolves HBARX Association from User's wallet
const getUserTokenBalance = (tokenBalances: MirrorNodeAccountBalance, tokenId: string) => {
  return tokenBalances?.tokens?.find((tokenBalance) => tokenBalance.token_id === tokenId)?.balance;
};

interface CalculateTotalValueLockedForPoolParams {
  /** Token balances for the liquidity pool. */
  poolTokenBalances: MirrorNodeAccountBalance;
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
const calculateTotalValueLockedForPool = (params: CalculateTotalValueLockedForPoolParams): BigNumber => {
  const { poolTokenBalances, tokenAAccountId, tokenBAccountId } = params;
  const tokenAPoolBalance = getTokenBalance(poolTokenBalances, tokenAAccountId);
  const tokenBPoolBalance = getTokenBalance(poolTokenBalances, tokenBAccountId);
  if (isNil(tokenAPoolBalance) || isNil(tokenBPoolBalance)) {
    return BigNumber(0);
  } else {
    const tokenAPoolBalanceInUSD = getValueInUSD();
    const tokenBPoolBalanceInUSD = getValueInUSD();
    return BigNumber(tokenAPoolBalanceInUSD)
      .times(tokenAPoolBalance)
      .plus(BigNumber(tokenBPoolBalanceInUSD).times(tokenBPoolBalance));
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
  tokenDecimals: string;
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
const calculateVolume = (params: CalculateVolumeParams): BigNumber => {
  const { poolAccountId, tokenAccountId, tokenDecimals, accountTransactions } = params;
  const allTokenTransfers = accountTransactions.flatMap((accountTransaction) => accountTransaction.token_transfers);
  const volume = allTokenTransfers.reduce(
    (tokenTransactionVolume: BigNumber, tokenTransfer: MirrorNodeTokenTransfer) => {
      const { token_id, account, amount } = tokenTransfer;
      if (account === poolAccountId && token_id === tokenAccountId) {
        return BigNumber(tokenTransactionVolume).plus(BigNumber(amount).abs());
      }
      return tokenTransactionVolume;
    },
    BigNumber(0)
  );
  return volume.shiftedBy(-Number(tokenDecimals)).times(getValueInUSD());
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
const calculateUserPoolLiquidity = (percentOfPool: BigNumber, totalValueLocked: BigNumber): BigNumber => {
  return percentOfPool.times(totalValueLocked);
};

interface CalculatePercentOfPoolParams {
  /** Token types and balances owned by the user's account. */
  userTokenBalances: MirrorNodeAccountBalance;
  /** Token types and balances owned by the liquidity pool account. */
  poolTokenBalances: MirrorNodeAccountBalance;
  /** Account ID of the liquidity pool. */
  liquidityTokenAccountId: string;
}

interface calculatePercentOfPoolFromTotalSupplyParams {
  userTokenBalances: MirrorNodeAccountBalance;
  tokenPair: TokenPair;
}

/**
 * Calculates the percentage in decimal format of the pool owned by an account.
 * mLP = My LP tokens for a pool
 * aLP = Total LP tokens for a pool
 * m = mLP/aLP
 * @param params - {@link CalculatePercentOfPoolParams}
 * @returns The percentage of the pool owned by an account.
 */
const calculatePercentOfPool = (params: CalculatePercentOfPoolParams): BigNumber => {
  const { userTokenBalances, poolTokenBalances, liquidityTokenAccountId } = params;
  const poolLPTokenBalance = getTokenBalance(poolTokenBalances, liquidityTokenAccountId);
  const userLPTokenBalance = getTokenBalance(userTokenBalances, liquidityTokenAccountId);
  if (isNil(poolLPTokenBalance) || isNil(userLPTokenBalance)) {
    console.error("Cannot find mirror node balance for LP token account ID.");
    return BigNumber(0);
  } else {
    return BigNumber(userLPTokenBalance).div(poolLPTokenBalance);
  }
};

const calculatePercentOfPoolFromTotalSupply = (params: calculatePercentOfPoolFromTotalSupplyParams): BigNumber => {
  const {
    userTokenBalances,
    tokenPair: {
      lpTokenMeta: { lpAccountId, totalSupply, decimals },
    },
  } = params;
  const userLPTokenBalance = getUserTokenBalance(userTokenBalances, lpAccountId ?? "");
  if (isNil(userLPTokenBalance)) {
    console.error("Cannot find mirror node balance for LP token account ID.");
    return BigNumber(0);
  } else {
    const number = totalSupply?.toString() ?? 0;
    const balance = BigNumber(number).shiftedBy(-Number(decimals));
    return BigNumber(userLPTokenBalance).div(balance);
  }
};

const isHbarToken = (tokenIdOrAddress: string): boolean => {
  return (
    tokenIdOrAddress === HBARTokenId ||
    tokenIdOrAddress === ethers.constants.AddressZero ||
    tokenIdOrAddress === "0.0.0"
  );
};

interface getAllPoolTransactionFeeParams {
  tokenPairs: TokenPair[] | null;
  tokenAId: string | undefined;
  tokenBId: string | undefined;
}

const getAllPoolTransactionFee = (params: getAllPoolTransactionFeeParams) => {
  return (
    params.tokenPairs
      ?.filter(
        (pair) =>
          (pair?.tokenA.tokenMeta.tokenId === params.tokenAId && pair?.tokenB.tokenMeta.tokenId === params.tokenBId) ||
          (pair?.tokenB.tokenMeta.tokenId === params.tokenAId && pair?.tokenA.tokenMeta.tokenId === params.tokenBId)
      )
      .flatMap((pair) => ({
        label: getTransactionFeeRateDisplay(pair.tokenA.tokenMeta.fee?.toNumber()),
        value: pair.tokenA.tokenMeta.fee?.toNumber() ?? 0,
      })) ?? []
  );
};

export {
  calculateTotalValueLockedForPool,
  calculateVolume,
  calculatePercentOfPool,
  calculateUserPoolLiquidity,
  getTransactionsFromLast24Hours,
  calculatePercentOfPoolFromTotalSupply,
  isHbarToken,
  getAllPoolTransactionFee,
};
