import { BigNumber } from "bignumber.js";
import numeral from "numeral";

const DefaultAmount = "--";
const DefaultPercent = "-.-%";

const formatToUSD = (number: number) => (number ? numeral(number).format("$0,0.00") : DefaultAmount);

const formatToPercent = (number: number) => (number ? numeral(number).format("0.00%") : DefaultPercent);

const formatBigNumberToUSD = (bigNumber: BigNumber | undefined) => {
  if (bigNumber === undefined) {
    return DefaultAmount;
  }
  return formatToUSD(bigNumber.toNumber());
};

const formatBigNumberToPercent = (bigNumber: BigNumber | undefined) => {
  if (bigNumber === undefined) {
    return DefaultPercent;
  }
  return formatToPercent(bigNumber.shiftedBy(-2).toNumber());
};

export { formatBigNumberToUSD, formatToUSD, formatBigNumberToPercent, formatToPercent };
