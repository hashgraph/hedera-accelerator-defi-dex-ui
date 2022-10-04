import { FormattedPoolDetails } from ".";
import { PoolState } from "../../../hooks";
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

export { formatPoolMetrics };
