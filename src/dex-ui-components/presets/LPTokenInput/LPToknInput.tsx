import { Text, Input as ChakraInput, FormControl, Skeleton } from "@chakra-ui/react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { Button } from "../../base";
import { TokenInputLayout } from "../layouts";
import { formulaTypes, LPTokenState } from "../types";
import { formatTokenBalance, halfOf } from "../utils";
import { ChangeEvent } from "react";
import { HashConnectConnectionState } from "hashconnect/dist/esm/types";

interface LPTokenInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldValue: string;
  label: string;
  isReadOnly?: boolean;
  selectedTokenId: string;
  walletConnectionStatus: HashConnectConnectionState;
  pairedAccountBalance: AccountBalanceJson | null;
  isLoading: boolean;
  isHalfAndMaxButtonsVisible?: boolean;
  onTokenAmountChanged?: (updatedToken: LPTokenState) => void;
}

/** TODO: Merge with TokenInput Component to create single component. */
export function LPTokenInput<T extends FieldValues>(props: LPTokenInputProps<T>) {
  const errors = props.form.formState.errors?.[props.fieldValue];
  const formValues = structuredClone(props.form.getValues());

  const formattedBalance = formatTokenBalance({
    symbol: formValues[props.fieldValue].lpAccountId ?? "",
    balance: formValues[props.fieldValue].userLpAmount ?? 0,
    walletConnectionStatus: props.walletConnectionStatus,
  });

  function handleTokenAmountChange(event: ChangeEvent<HTMLInputElement>) {
    const inputElement = event?.target as HTMLInputElement;
    const tokenAmount = Number(inputElement.value);
    const updatedToken: LPTokenState = {
      ...formValues[props.fieldValue],
      amount: tokenAmount,
    };
    props.form.setValue(`${props.fieldValue}.amount` as any, tokenAmount as any);
    props.onTokenAmountChanged?.(updatedToken);
  }

  function setInputAmountWithFormula(formula: formulaTypes = formulaTypes.MAX) {
    const tokenBalance = formValues[props.fieldValue].userLpAmount;
    if (tokenBalance === undefined) {
      return;
    }
    const tokenInputAmount = formula === formulaTypes.MAX ? tokenBalance : halfOf(tokenBalance);
    const updatedToken = {
      ...formValues[props.fieldValue],
      amount: tokenInputAmount,
    };
    props.form.setValue(`${props.fieldValue}.amount` as any, updatedToken.amount as any);
    props.form.setValue(`${props.fieldValue}.displayAmount` as any, String(updatedToken.amount) as any);
  }

  function handleMaxButtonClicked() {
    setInputAmountWithFormula(formulaTypes.MAX);
  }

  function handleHalfButtonClicked() {
    setInputAmountWithFormula(formulaTypes.HALF);
  }

  return (
    <TokenInputLayout
      title={<Text textStyle="h4">{props.label}</Text>}
      hideTokenSymbolSelector
      tokenAmountInput={
        <FormControl isInvalid={Boolean(errors)}>
          <ChakraInput
            type="number"
            step="any"
            variant="token-amount-input"
            placeholder="0"
            isReadOnly={props.isReadOnly}
            {...props.form.register(`${props.fieldValue}.displayAmount` as any, {
              onChange: handleTokenAmountChange,
            })}
          />
        </FormControl>
      }
      tokenSymbolSelector={undefined}
      userTokenBalance={
        <Skeleton speed={0.4} fadeDuration={0} isLoaded={!props.isLoading}>
          <Text textStyle="h4" marginRight="0.5rem">
            {formattedBalance}
          </Text>
        </Skeleton>
      }
      halfAndMaxButtons={
        props.isHalfAndMaxButtonsVisible ? (
          <>
            <Button variant="link" textStyle="link" onClick={handleHalfButtonClicked}>
              Half
            </Button>
            <Button variant="link" textStyle="link" onClick={handleMaxButtonClicked}>
              Max
            </Button>
          </>
        ) : (
          <></>
        )
      }
    />
  );
}
