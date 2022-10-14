import { FormattedPoolDetails, FormattedUserPoolDetails } from ".";
import { PoolState, UserPoolState } from "../../store/poolsSlice";
import { formatToUSD, formatToPercent } from "../../utils";

/**
 * Coverts data associated with a liquidity pool into a format
 * that will be displayed in the UI.
 * @param poolState - Data associated with a liquidity pool.
 * @returns A formatted version of the liquidity pool data.
 */
const formatPoolMetrics = (poolState: PoolState): FormattedPoolDetails => {
  return {
    name: poolState.name,
    fee: formatToPercent(poolState.fee),
    totalVolumeLocked: formatToUSD(poolState.totalVolumeLocked),
    past24HoursVolume: formatToUSD(poolState.past24HoursVolume),
    past7daysVolume: formatToUSD(poolState.past7daysVolume),
  };
};

/**
 * Coverts data associated with a user's share of a liquidity pool
 * into a format that will be displayed in the UI.
 * @param userPoolState - Data associated with the user's share of a pool.
 * @returns A formatted version of the user's liquidity pool data.
 */
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
