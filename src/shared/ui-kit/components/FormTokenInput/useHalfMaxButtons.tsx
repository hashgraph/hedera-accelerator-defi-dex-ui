import { formulaTypes } from "../";
import BigNumber from "bignumber.js";

export function useHalfMaxButtons(
  maxBalance: string,
  decimals: string,
  amountSetter: (amount: string | undefined) => void
) {
  function setInputAmountWithFormula(formula: formulaTypes = formulaTypes.MAX) {
    if (BigNumber(maxBalance).isNaN() || isNaN(Number(decimals))) {
      return amountSetter(undefined);
    }
    const newAmount =
      formula === formulaTypes.MAX
        ? maxBalance
        : BigNumber(maxBalance).div(2).dp(Number(decimals), BigNumber.ROUND_HALF_UP).toString();
    amountSetter(newAmount);
  }

  function handleMaxButtonClicked() {
    setInputAmountWithFormula(formulaTypes.MAX);
  }

  function handleHalfButtonClicked() {
    setInputAmountWithFormula(formulaTypes.HALF);
  }

  return {
    handleMaxButtonClicked,
    handleHalfButtonClicked,
  };
}
