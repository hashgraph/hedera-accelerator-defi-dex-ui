import { useState } from "react";
import { useInput } from "../../../dex-ui/hooks/useInput";

interface UseFormSettingsProps {
  initialSlippage: number;
  initialTransactionDeadline: number;
}

export function useFormSettings(props: UseFormSettingsProps) {
  const { value: slippage, handleChange: handleSlippageChanged } = useInput<number>(props.initialSlippage);
  const { value: transactionDeadline, handleChange: handleTransactionDeadlineChanged } = useInput<number>(
    props.initialTransactionDeadline
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  function handleSettingsButtonClicked() {
    setIsSettingsOpen(!isSettingsOpen);
  }

  return {
    slippage,
    transactionDeadline,
    isSettingsOpen,
    handleSlippageChanged,
    handleTransactionDeadlineChanged,
    handleSettingsButtonClicked,
  };
}
