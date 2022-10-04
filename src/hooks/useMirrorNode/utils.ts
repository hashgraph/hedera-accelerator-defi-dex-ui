import { SWAP_CONTRACT_ID } from "../constants";
import { isNil } from "ramda";
import { TokenPair } from "./types";

// TODO: get from USDC_TOKEN_ID
export const getValueInUSD = (/* tokenAccountId */): number => 1;

interface MirrorNodeTokenBalance {
  token_id: string;
  balance: number;
}

export const calculateTotalValueLockedForPool = (
  accountBalances: any,
  firstTokenAccountId: string,
  secondTokenAccountId: string
): number => {
  const poolTokenBalances: MirrorNodeTokenBalance[] = accountBalances.find(
    (accountBalance: any) => accountBalance.account === SWAP_CONTRACT_ID
  )?.tokens;

  const firstTokenPoolBalance = poolTokenBalances.find(
    (poolTokenBalance: any) => poolTokenBalance.token_id === firstTokenAccountId
  )?.balance;
  const secondTokenPoolBalance = poolTokenBalances.find(
    (poolTokenBalance) => poolTokenBalance.token_id === secondTokenAccountId
  )?.balance;

  if (isNil(firstTokenPoolBalance) || isNil(secondTokenPoolBalance)) {
    console.error("Cannot find mirror node balance for token account ID.");
    return 0;
  } else {
    const firstTokenPoolBalanceInUSD = getValueInUSD();
    const secondTokenPoolBalanceInUSD = getValueInUSD();
    return firstTokenPoolBalance * firstTokenPoolBalanceInUSD + secondTokenPoolBalance * secondTokenPoolBalanceInUSD;
  }
};

// TODO
export const calculate24HVolume = () => {
  return 0;
};

// TODO
export const calculate7DVolume = () => {
  return 0;
};

// TODO
export const calculatePercentOfPool = () => {
  return 0;
};

export const calculatePoolVolumeMetrics = (accountBalances: [], tokenPair: TokenPair) => {
  const { tokenA, tokenB } = tokenPair;
  return {
    name: `${tokenA.symbol}/${tokenB.symbol}`,
    fee: 0.05,
    totalVolumeLocked: calculateTotalValueLockedForPool(accountBalances, tokenA.accountId, tokenB.accountId),
    past24HoursVolume: 0.0,
    past7daysVolume: 0.0,
  };
};
