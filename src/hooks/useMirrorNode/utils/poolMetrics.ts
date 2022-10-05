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

const calculateVolume = (tokenAccountId: string, contractTransactions: MirrorNodeTransaction[]) => {
  const tokenTransfers = contractTransactions.flatMap((contractTransaction) => contractTransaction.token_transfers);
  const volume = tokenTransfers.reduce((tokenTransactionVolume: number, tokenTransfer: MirrorNodeTokenTransfer) => {
    const { token_id, amount } = tokenTransfer;
    if (token_id === tokenAccountId && amount > 0) {
      return tokenTransactionVolume + amount;
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
  accountBalances: any;
  last24Transactions: MirrorNodeTransaction[];
  last7DTransactions: MirrorNodeTransaction[];
  tokenPair: TokenPair;
}

export const calculatePoolVolumeMetrics = ({
  accountBalances,
  last24Transactions,
  last7DTransactions,
  tokenPair,
}: CalculatePoolMetricsParams): PoolState => {
  const { tokenA, tokenB } = tokenPair;
  return {
    name: `${tokenA.symbol}/${tokenB.symbol}`,
    fee: 0.05,
    totalVolumeLocked: calculateTotalValueLockedForPool({
      accountBalances,
      tokenAAccountId: tokenA.accountId,
      tokenBAccountId: tokenB.accountId,
    }),
    past24HoursVolume: calculateVolume(tokenA.accountId, last24Transactions),
    past7daysVolume: calculateVolume(tokenA.accountId, last7DTransactions),
  };
};
