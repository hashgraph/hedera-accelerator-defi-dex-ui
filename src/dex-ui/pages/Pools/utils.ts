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
  const { name, fee, totalVolumeLocked, past24HoursVolume, past7daysVolume } = poolState;
  return {
    name,
    fee: fee ? formatToPercent(fee) : "-",
    totalVolumeLocked: formatToUSD(totalVolumeLocked),
    past24HoursVolume: formatToUSD(past24HoursVolume),
    past7daysVolume: formatToUSD(past7daysVolume),
  };
};

/**
 * Coverts data associated with a user's share of a liquidity pool
 * into a format that will be displayed in the UI.
 * @param userPoolState - Data associated with the user's share of a pool.
 * @returns A formatted version of the user's liquidity pool data.
 */
const formatUserPoolMetrics = (userPoolState: UserPoolState): FormattedUserPoolDetails => {
  const { name, fee, liquidity, percentOfPool, unclaimedFees } = userPoolState;
  return {
    name,
    fee: fee ? formatToPercent(fee) : "-",
    liquidity: formatToUSD(liquidity),
    percentOfPool: formatToPercent(percentOfPool),
    unclaimedFees: formatToPercent(unclaimedFees),
  };
};

export { formatPoolMetrics, formatUserPoolMetrics };
