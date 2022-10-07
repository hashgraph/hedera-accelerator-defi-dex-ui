import { A_B_PAIR_TOKEN_ID, SWAP_CONTRACT_ID } from "../../constants";
import { isNil } from "ramda";
import {
  MirrorNodeTransaction,
  PoolState,
  TokenPair,
  MirrorNodeAccountBalance,
  MirrorNodeTokenTransfer,
  UserPoolState,
} from "../types";

// TODO: Need to get token coversion rate from USDC_TOKEN_ID
const getValueInUSD = (/* tokenAccountId */): number => 1;

interface CalculateTotalValueLockedForPoolParams {
  poolAccountBalances: MirrorNodeAccountBalance[];
  tokenAAccountId: string;
  tokenBAccountId: string;
}

const calculateTotalValueLockedForPool = ({
  poolAccountBalances,
  tokenAAccountId,
  tokenBAccountId,
}: CalculateTotalValueLockedForPoolParams): number => {
  const poolTokenBalances = poolAccountBalances.find(
    (poolAccountBalance) => poolAccountBalance.account === SWAP_CONTRACT_ID
  )?.tokens;

  const tokenAPoolBalance = poolTokenBalances?.find(
    (poolTokenBalance) => poolTokenBalance.token_id === tokenAAccountId
  )?.balance;
  const tokenBPoolBalance = poolTokenBalances?.find(
    (poolTokenBalance) => poolTokenBalance.token_id === tokenBAccountId
  )?.balance;

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
    if (account === poolAccountId && token_id === tokenAccountId && amount >= 0) {
      return tokenTransactionVolume + amount;
    }
    return tokenTransactionVolume;
  }, 0);
  return volume * getValueInUSD();
};

// TODO
const calculateUserPoolLiquidity = (percentOfPool: number, totalVolumeLocked: number): number => {
  return percentOfPool * totalVolumeLocked;
};

// TODO
const calculatePercentOfPool = ({ userAccountBalances, poolAccountBalances, LPAccountId }: any): number => {
  const poolTokenBalances = poolAccountBalances.find(
    (poolAccountBalance: any) => poolAccountBalance.account === SWAP_CONTRACT_ID
  )?.tokens;

  const poolLPTokenBalance = poolTokenBalances?.find(
    (poolTokenBalance: any) => poolTokenBalance.token_id === LPAccountId
  )?.balance;

  const userTokenBalances = userAccountBalances.find(
    (userAccountBalance: any) => userAccountBalance.account === "0.0.34728121" // wallet address
  )?.tokens;

  const userLPTokenBalance = userTokenBalances?.find(
    (userTokenBalance: any) => userTokenBalance.token_id === LPAccountId
  )?.balance;

  if (isNil(poolLPTokenBalance) || isNil(userLPTokenBalance)) {
    console.error("Cannot find mirror node balance for LP token account ID.");
    return 0;
  } else {
    return userLPTokenBalance / poolLPTokenBalance;
  }
};

interface CalculateUserPoolMetricsParams {
  allPoolsMetrics: PoolState[];
  poolAccountBalances: any;
  userAccountBalances: any;
  tokenPair: TokenPair;
}

const calculateUserPoolMetrics = ({
  allPoolsMetrics,
  poolAccountBalances,
  userAccountBalances,
  tokenPair,
}: CalculateUserPoolMetricsParams): UserPoolState => {
  const { pairToken, tokenA, tokenB } = tokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolAccountBalances,
    tokenAAccountId: tokenA.accountId,
    tokenBAccountId: tokenB.accountId,
  });
  const percentOfPool = calculatePercentOfPool({
    userAccountBalances,
    poolAccountBalances,
    LPAccountId: pairToken.accountId,
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
  poolAccountBalances: any;
  last24Transactions: MirrorNodeTransaction[];
  last7DTransactions: MirrorNodeTransaction[];
  tokenPair: TokenPair;
}

const calculatePoolMetrics = ({
  poolAccountId,
  poolAccountBalances,
  last24Transactions,
  last7DTransactions,
  tokenPair,
}: CalculatePoolMetricsParams): PoolState => {
  const { tokenA, tokenB } = tokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    poolAccountBalances,
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

export { calculatePoolMetrics, calculateUserPoolMetrics };
