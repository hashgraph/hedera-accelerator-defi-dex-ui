import { BigNumber } from "bignumber.js";
import numeral from "numeral";

export const DefaultAmount = "--";
export const DefaultPercent = "-.-%";

export const formatToUSD = (number: number) => (number ? numeral(number).format("$0,0.00") : DefaultAmount);

export const formatToPercent = (number: number) => (number ? numeral(number).format("0.00%") : DefaultPercent);

export const formatBigNumberToUSD = (bigNumber: BigNumber | undefined) => {
  if (bigNumber === undefined) {
    return DefaultAmount;
  }
  return formatToUSD(bigNumber.toNumber());
};

export const formatBigNumberToPercent = (bigNumber: BigNumber | undefined) => {
  if (bigNumber === undefined) {
    return DefaultPercent;
  }
  return formatToPercent(bigNumber.toNumber());
};

export function withPrecision(number: BigNumber, precision: BigNumber) {
  return number.div(precision.toNumber());
}
/**
 * Converts a number value entered in an input field to a precision integer.
 * @example
 * valueToPercentAsNumberWithPrecision(0.5, 100000000) -\> 500000
 * @param inputValue - The number entered in an input field.
 * @param precision - The precision used to determine the number of decimals to shift the input value.
 * @returns The inputValue as a precision integer.
 */
export function valueToPercentAsNumberWithPrecision(inputValue: number, precision: BigNumber): BigNumber {
  const percentAsNumber = BigNumber(inputValue).shiftedBy(-2);
  return percentAsNumber.shiftedBy(Math.log10(precision.toNumber()));
}

export function formatTokenAmountWithDecimal(amount: number, decimals: number): number {
  return BigNumber(amount).shiftedBy(-decimals).toNumber();
}
