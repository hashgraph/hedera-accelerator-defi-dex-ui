import numeral from "numeral";

const formatToUSD = (number: number) => numeral(number).format("$0,0");
const formatToPercent = (number: number) => numeral(number).format("0.00%");

export { formatToUSD, formatToPercent };
