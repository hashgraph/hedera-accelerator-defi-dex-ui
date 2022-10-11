const HOURS_IN_A_DAY = 24;
const MINUTES_IN_AN_HOUR = 60;
const SECONDS_IN_A_MINUTE = 60;
const MILLISECONDS_IN_A_SECOND = 1000;
const MILLISECONDS_IN_A_DAY = HOURS_IN_A_DAY * MINUTES_IN_AN_HOUR * SECONDS_IN_A_MINUTE * MILLISECONDS_IN_A_SECOND;

/**
 * NOTE: These time calculation functions have not been optimized for nanosecond
 * precision. We will need to optimize these date functions in the future.
 * */

/**
 * Gets the timestamp in seconds.nanoseconds format from a specified number of days ago, i.e. N.
 * @param NDaysAgo - The number of days in the past the timestamp should be computed from.
 * @returns The timestamp N Days ago in seconds.nanoseconds format.
 * */
const getTimestampNDaysAgo = (NDaysAgo: number): string => {
  const currentTimestampInMS = new Date().getTime();
  const millisecondsInNDays = NDaysAgo * MILLISECONDS_IN_A_DAY;
  const timestampDaysAgo = new Date(currentTimestampInMS - millisecondsInNDays).getTime() / MILLISECONDS_IN_A_SECOND;
  return timestampDaysAgo.toString();
};

const getTimestamp24HoursAgo = () => getTimestampNDaysAgo(1);
const getTimestamp7DaysAgo = () => getTimestampNDaysAgo(7);

export { getTimestamp24HoursAgo, getTimestamp7DaysAgo };
