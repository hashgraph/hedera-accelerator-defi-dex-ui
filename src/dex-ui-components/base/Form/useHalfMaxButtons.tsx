import { formulaTypes } from "@dex-ui-components/presets/types";
import { halfOf } from "@dex-ui-components/presets/utils";
import { useState } from "react";

export function useHalfMaxButtons(initialAmount: number, amountSetter?: (amount: number) => void) {
  const [amount, setAmount] = useState(initialAmount);

  function setInputAmountWithFormula(formula: formulaTypes = formulaTypes.MAX) {
    const newAmount = formula === formulaTypes.MAX ? initialAmount : halfOf(Number(initialAmount));
    amountSetter ? amountSetter(newAmount) : setAmount(newAmount);
  }

  function handleMaxButtonClicked() {
    setInputAmountWithFormula(formulaTypes.MAX);
  }

  function handleHalfButtonClicked() {
    setInputAmountWithFormula(formulaTypes.HALF);
  }
  return {
    amount,
    handleMaxButtonClicked,
    handleHalfButtonClicked,
  };
}
