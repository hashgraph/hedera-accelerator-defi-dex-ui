import { isNil } from "ramda";
import { useState } from "react";
import { useInput } from "../../../dex-ui/hooks/useInput";
import { DefaultAmount, DefaultPercent } from "../../../dex-ui/utils";
import { TransactionDeadline } from "../constants";
interface UseFormSettingsProps {
  slippage: number;
  priceImpact?: number;
  transactionDeadline: number;
}

export function useFormSettings(props: UseFormSettingsProps) {
  const { value: slippage, handleChange: handleSlippageChanged } = useInput<number>(props.slippage);
  const { value: transactionDeadline, handleChange: handleTransactionDeadlineChanged } = useInput<number>(
    props.transactionDeadline
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const formattedSlippage = slippage > 0 ? `${Number(slippage)?.toFixed(2)}%` : DefaultPercent;
  const formattedTransactionDeadline =
    transactionDeadline > TransactionDeadline.Min ? `${Number(transactionDeadline)} min` : DefaultAmount;

  const isUserSetSlippageBreached = !isNil(props.priceImpact) ? props.priceImpact > slippage : false;
  const isTransactionDeadlineValid =
    transactionDeadline > TransactionDeadline.Min && transactionDeadline <= TransactionDeadline.Max;

  const transactionDeadlineErrorMessage = createTransactionDeadlineErrorMessage(transactionDeadline);
  const slippageBreachedErrorMessage = "The price impact is over the set slippage tolerance.";

  function createTransactionDeadlineErrorMessage(transactionDeadline: number): string {
    if (transactionDeadline <= TransactionDeadline.Min) {
      return "Transaction deadline must be greater than 0 minutes.";
    }
    if (transactionDeadline > TransactionDeadline.Max) {
      return "Transaction deadline is over the maximum allowed time limit (3 minutes).";
    }
    return "";
  }

  function handleSettingsButtonClicked() {
    setIsSettingsOpen(!isSettingsOpen);
  }

  return {
    slippage,
    transactionDeadline,
    formattedSlippage,
    formattedTransactionDeadline,
    isUserSetSlippageBreached,
    isTransactionDeadlineValid,
    slippageBreachedErrorMessage,
    transactionDeadlineErrorMessage,
    isSettingsOpen,
    handleSlippageChanged,
    handleTransactionDeadlineChanged,
    handleSettingsButtonClicked,
  };
}
