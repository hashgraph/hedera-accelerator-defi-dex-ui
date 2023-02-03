import { Input } from "../..";
import { DefiFormSettingsLayout } from "../layouts";
import { UseFormRegister } from "react-hook-form";
import { ChangeEvent } from "react";

interface FormSettingsProps {
  isSlippageBreached?: boolean;
  isSettingsOpen: boolean;
  handleSlippageChanged: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTransactionDeadlineChanged: (event: ChangeEvent<HTMLInputElement>) => void;
  register: UseFormRegister<any>;
}

export function FormSettings(props: FormSettingsProps) {
  return (
    <DefiFormSettingsLayout isSettingsOpen={props.isSettingsOpen}>
      <Input<"slippage">
        type="number"
        step="any"
        label="Slippage"
        id="slippage"
        tooltipLabel={`Slippage refers to the difference between the expected 
  price of a trade and the price at which the trade is executed.`}
        isTooltipVisible={true}
        unit="%"
        isError={props.isSlippageBreached}
        register={props.register("slippage", {
          validate: () => !props.isSlippageBreached,
          onChange: props.handleSlippageChanged,
        })}
      />
      <Input<"transactionDeadline">
        type="number"
        step="any"
        label="Transaction Deadline"
        id="transactionDeadline"
        tooltipLabel={`If your transaction is not completed within the deadline, it will revert and your coins
  (less the fee) will be returned to you.`}
        isTooltipVisible={true}
        unit="min"
        register={props.register("transactionDeadline", { onChange: props.handleTransactionDeadlineChanged })}
      />
    </DefiFormSettingsLayout>
  );
}
