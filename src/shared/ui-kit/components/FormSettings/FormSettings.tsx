import { Input } from "../..";
import { DefiFormSettingsLayout } from "../layouts";
import { UseFormRegister } from "react-hook-form";
import { ChangeEvent } from "react";
import { Spacer } from "@chakra-ui/react";

interface FormSettingsProps {
  isSlippageBreached?: boolean;
  isSettingsOpen: boolean;
  hideSlippage?: boolean;
  isTransactionDeadlineValid?: boolean;
  initialSlippage?: string | undefined;
  initialTransactionDeadline?: string | undefined;
  handleSlippageChanged?: (event: ChangeEvent<HTMLInputElement>) => void;
  handleTransactionDeadlineChanged: (event: ChangeEvent<HTMLInputElement>) => void;
  register: UseFormRegister<any>;
}

export function FormSettings(props: FormSettingsProps) {
  return (
    <DefiFormSettingsLayout isSettingsOpen={props.isSettingsOpen}>
      {props.hideSlippage ? (
        <Spacer flex="1" />
      ) : (
        <Input<"slippage">
          flex="1"
          type="number"
          step="any"
          label="Slippage"
          id="slippage"
          tooltipLabel={`Slippage refers to the difference between the expected 
  price of a trade and the price at which the trade is executed.`}
          isTooltipVisible={true}
          unit="%"
          value={props.initialSlippage}
          isError={props.isSlippageBreached}
          register={props.register("slippage", {
            validate: () => !props.isSlippageBreached,
            onChange: props.handleSlippageChanged,
          })}
        />
      )}
      <Input<"transactionDeadline">
        flex="1"
        type="number"
        step="any"
        label="Transaction Deadline"
        id="transactionDeadline"
        tooltipLabel={`If your transaction is not completed within the deadline, it will revert and your coins
  (less the fee) will be returned to you.`}
        isTooltipVisible={true}
        unit="min"
        isError={!props.isTransactionDeadlineValid}
        value={props.initialTransactionDeadline}
        register={props.register("transactionDeadline", {
          validate: () => props.isTransactionDeadlineValid,
          onChange: props.handleTransactionDeadlineChanged,
        })}
      />
    </DefiFormSettingsLayout>
  );
}
