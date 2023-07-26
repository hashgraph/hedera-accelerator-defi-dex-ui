import { formulaTypes } from "@dex-ui-components/presets/types";
import BigNumber from "bignumber.js";

export function useHalfMaxButtons(maxBalance: string, amountSetter: (amount: string | undefined) => void) {
  function setInputAmountWithFormula(formula: formulaTypes = formulaTypes.MAX) {
    if (BigNumber(maxBalance).isNaN()) {
      return amountSetter(undefined);
    }
    const newAmount = formula === formulaTypes.MAX ? maxBalance : BigNumber(maxBalance).div(2).toString();
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
