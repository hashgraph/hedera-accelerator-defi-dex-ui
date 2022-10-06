import { SWAP_CONTRACT_ID } from "../../constants";
import { isNil } from "ramda";
import {
  MirrorNodeTransaction,
  PoolState,
  TokenPair,
  MirrorNodeAccountBalance,
  MirrorNodeTokenTransfer,
} from "../types";

// TODO: Need to get token coversion rate from USDC_TOKEN_ID
const getValueInUSD = (/* tokenAccountId */): number => 1;

interface CalculateTotalValueLockedForPoolParams {
  accountBalances: MirrorNodeAccountBalance[];
  tokenAAccountId: string;
  tokenBAccountId: string;
}

const calculateTotalValueLockedForPool = ({
  accountBalances,
  tokenAAccountId,
  tokenBAccountId,
}: CalculateTotalValueLockedForPoolParams): number => {
  const poolTokenBalances = accountBalances.find(
    (accountBalance) => accountBalance.account === SWAP_CONTRACT_ID
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
    if (account === poolAccountId && token_id === tokenAccountId) {
      return tokenTransactionVolume + Math.abs(amount);
    }
    return tokenTransactionVolume;
  }, 0);
  return volume * getValueInUSD();
};

// TODO
// const calculatePercentOfPool = () => {
//   return 0;
// };

interface CalculatePoolMetricsParams {
  poolAccountId: string;
  accountBalances: any;
  last24Transactions: MirrorNodeTransaction[];
  last7DTransactions: MirrorNodeTransaction[];
  tokenPair: TokenPair;
}

const calculatePoolMetrics = ({
  poolAccountId,
  accountBalances,
  last24Transactions,
  last7DTransactions,
  tokenPair,
}: CalculatePoolMetricsParams): PoolState => {
  const { tokenA, tokenB } = tokenPair;
  const totalVolumeLocked = calculateTotalValueLockedForPool({
    accountBalances,
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

export { calculatePoolMetrics };
