import { FormattedPoolDetails, FormattedUserPoolDetails } from ".";
import { PoolState, UserPoolState } from "../../../hooks";
import { formatToUSD, formatToPercent } from "../../utils";

const formatPoolMetrics = (poolState: PoolState): FormattedPoolDetails => {
  return {
    name: poolState.name,
    fee: formatToPercent(poolState.fee),
    totalVolumeLocked: formatToUSD(poolState.totalVolumeLocked),
    past24HoursVolume: formatToUSD(poolState.past24HoursVolume),
    past7daysVolume: formatToUSD(poolState.past7daysVolume),
  };
};

const formatUserPoolMetrics = (userPoolState: UserPoolState): FormattedUserPoolDetails => {
  return {
    name: userPoolState.name,
    fee: formatToPercent(userPoolState.fee),
    liquidity: formatToUSD(userPoolState.liquidity),
    percentOfPool: formatToPercent(userPoolState.percentOfPool),
    unclaimedFees: formatToPercent(userPoolState.unclaimedFees),
  };
};

export { formatPoolMetrics, formatUserPoolMetrics };
