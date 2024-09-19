import { Text, Input as ChakraInput, FormControl, Skeleton, Button } from "@chakra-ui/react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { TokenSelector } from "../../components";
import { TokenInputLayout } from "../layouts";
import { TokenPair } from "../SwapTokensForm/types";
import { formulaTypes, TokenState } from "../types";
import { formatTokenBalance, getTokenBalance, getTokenData, halfOf } from "@shared/utils";
import { ChangeEvent, useEffect } from "react";
import { Token as TokenInputType } from "./types";
import { InitialTokenState } from "../constants";
import { HashConnectConnectionState } from "hashconnect/dist/types";

const DefaultTokenMeta = InitialTokenState.tokenMeta;

interface TokenInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldValue: string;
  label: string;
  isReadOnly?: boolean;
  selectedTokenId: string;
  walletConnectionStatus: HashConnectConnectionState;
  pairedAccountBalance: AccountBalanceJson | null;
  isLoading: boolean;
  isHalfAndMaxButtonsVisible?: boolean;
  tokenPairs: TokenPair[] | null;
  selectableTokens: TokenInputType[];
  onTokenAmountChanged?: (updatedToken: TokenState) => void;
  onTokenSymbolChanged?: (updatedToken: TokenState) => void;
  onSetInputAmountWithFormula?: (updatedToken: TokenState) => void;
}

export function TokenInput<T extends FieldValues>(props: TokenInputProps<T>) {
  const errors = props.form.formState.errors?.[props.fieldValue];
  const formValues = structuredClone(props.form.getValues());

  const formattedBalance = formatTokenBalance({
    symbol: formValues[props.fieldValue].symbol ?? "",
    balance: formValues[props.fieldValue].balance ?? 0,
    walletConnectionStatus: props.walletConnectionStatus,
  });

  /** Update Token Balance */
  useEffect(() => {
    const balance = getTokenBalance(formValues[props.fieldValue]?.tokenMeta.tokenId, props.pairedAccountBalance);
    props.form.setValue(`${props.fieldValue}.balance` as any, balance as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(props.pairedAccountBalance)]);

  function handleTokenAmountChange(event: ChangeEvent<HTMLInputElement>) {
    const inputElement = event?.target as HTMLInputElement;
    const tokenAmount = Number(inputElement.value);
    const updatedToken: TokenState = {
      ...formValues[props.fieldValue],
      amount: tokenAmount,
    };
    props.form.setValue(`${props.fieldValue}.amount` as any, tokenAmount as any);
    props.onTokenAmountChanged?.(updatedToken);
  }

  function handleTokenSymbolChange(event: ChangeEvent<HTMLInputElement>) {
    const inputElement = event?.target as HTMLInputElement;
    const tokenId = inputElement.value;
    const token = getTokenData(tokenId, props.selectableTokens);
    const balance = getTokenBalance(tokenId, props.pairedAccountBalance as any);
    const updatedToken: TokenState = {
      ...formValues[props.fieldValue],
      symbol: token?.symbol,
      balance: balance,
      tokenMeta: token?.tokenMeta ?? DefaultTokenMeta,
    };
    props.form.setValue(`${props.fieldValue}.tokenMeta` as any, (updatedToken.tokenMeta ?? DefaultTokenMeta) as any);
    props.form.setValue(`${props.fieldValue}.symbol` as any, updatedToken.symbol as any);
    props.form.setValue(`${props.fieldValue}.balance` as any, updatedToken.balance as any);
    props.onTokenSymbolChanged?.(updatedToken);
  }

  function setInputAmountWithFormula(formula: formulaTypes = formulaTypes.MAX) {
    const tokenBalance = formValues[props.fieldValue].balance;
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
    props.onSetInputAmountWithFormula?.(updatedToken);
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
      tokenSymbolSelector={
        <Skeleton speed={0.4} fadeDuration={0} isLoaded={!props.isLoading}>
          <TokenSelector
            value={props.selectedTokenId}
            tokenPairs={props.selectableTokens ?? []}
            selectControls={props.form.register(`${props.fieldValue}.tokenMeta.tokenId` as any, {
              onChange: handleTokenSymbolChange,
            })}
          />
        </Skeleton>
      }
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
