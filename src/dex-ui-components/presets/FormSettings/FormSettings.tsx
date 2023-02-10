import { Input } from "../..";
import { DefiFormSettingsLayout } from "../layouts";
import { UseFormRegister } from "react-hook-form";
import { ChangeEvent } from "react";

interface FormSettingsProps {
  isSettingsOpen: boolean;
  hideSlippageField?: boolean;
  handleSlippageChanged: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTransactionDeadlineChanged: (event: ChangeEvent<HTMLInputElement>) => void;
  register: UseFormRegister<any>;
}

export function FormSettings(props: FormSettingsProps) {
  return (
    <DefiFormSettingsLayout isSettingsOpen={props.isSettingsOpen}>
      {!props.hideSlippageField ? (
        <Input<"slippage">
          type="number"
          step="any"
          label="Slippage"
          id="slippage"
          tooltipLabel={`Slippage refers to the difference between the expected 
  price of a trade and the price at which the trade is executed.`}
          isTooltipVisible={true}
          unit="%"
          register={props.register("slippage", { onChange: props.handleSlippageChanged })}
        />
      ) : undefined}

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
