import { BigNumber } from "bignumber.js";
import numeral from "numeral";

const DEFAULT = "-";

const formatToUSD = (number: number) => (number ? numeral(number).format("$0,0.00") : DEFAULT);

const formatToPercent = (number: number) => (number ? numeral(number).format("0.00%") : DEFAULT);

const formatBigNumberToUSD = (bigNumber: BigNumber | undefined) => {
  if (bigNumber === undefined) {
    return DEFAULT;
  }
  return formatToUSD(bigNumber.toNumber());
};

const formatBigNumberToPercent = (bigNumber: BigNumber | undefined) => {
  if (bigNumber === undefined) {
    return DEFAULT;
  }
  return formatToPercent(bigNumber.shiftedBy(-2).toNumber());
};

export { formatBigNumberToUSD, formatToUSD, formatBigNumberToPercent, formatToPercent };
