import { FormattedPoolDetails, FormattedUserPoolDetails } from ".";
import { Pool, UserPool } from "../../store/poolsSlice";
import { formatBigNumberToUSD, formatBigNumberToPercent } from "../../utils";

/**
 * Coverts data associated with a liquidity pool into a format
 * that will be displayed in the UI.
 * @param poolState - Data associated with a liquidity pool.
 * @returns A formatted version of the liquidity pool data.
 */
const formatPoolMetrics = (poolState: Pool): FormattedPoolDetails => {
  const { name, fee, totalVolumeLocked, past24HoursVolume, past7daysVolume, pairAccountId } = poolState;
  return {
    name,
    fee: formatBigNumberToPercent(fee),
    totalVolumeLocked: formatBigNumberToUSD(totalVolumeLocked),
    past24HoursVolume: formatBigNumberToUSD(past24HoursVolume),
    past7daysVolume: formatBigNumberToUSD(past7daysVolume),
    pairAccountId,
  };
};

/**
 * Coverts data associated with a user's share of a liquidity pool
 * into a format that will be displayed in the UI.
 * @param userPoolState - Data associated with the user's share of a pool.
 * @returns A formatted version of the user's liquidity pool data.
 */
const formatUserPoolMetrics = (userPoolState: UserPool): FormattedUserPoolDetails => {
  const { name, fee, liquidity, percentOfPool, unclaimedFees, userTokenPair } = userPoolState;
  return {
    name,
    fee: formatBigNumberToPercent(fee),
    liquidity: formatBigNumberToUSD(liquidity),
    percentOfPool: formatBigNumberToPercent(percentOfPool),
    unclaimedFees: formatBigNumberToUSD(unclaimedFees),
    pairLpAccountId: userTokenPair?.lpTokenMeta.lpAccountId,
  };
};

export { formatPoolMetrics, formatUserPoolMetrics };
