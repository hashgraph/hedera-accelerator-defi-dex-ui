import { TokenBalance, useAccountTokenBalances } from "@dex/hooks";
import { UseFormReturn } from "react-hook-form";
import BigNumber from "bignumber.js";
import { isEmpty, isNil } from "ramda";
import { HBARTokenId } from "@dex/services";
import { Divider, Flex, useDisclosure, Button } from "@chakra-ui/react";
import { Color } from "../../themes";
import { FormInput } from "../Inputs";
import { useState } from "react";
import { useFormTokenInputPattern } from "./useFormTokenInputPattern";
import { FormTokenInputSelectTokenModal } from "./FormTokenInputSelectTokenModal";
import FormTokenInputContext from "./FormTokenInputContext";
import { FormTokenInputHalfMaxButtons } from "./FormTokenInputHalfMaxButtons";
import { FormTokenInputSelectTokenButton } from "./FormTokenInputSelectTokenButton";
import { FormTokenInputLabel } from "./FormTokenInputLabel";

FormTokenInput.Label = FormTokenInputLabel;
FormTokenInput.HalfMaxButtons = FormTokenInputHalfMaxButtons;
FormTokenInput.SelectTokenButton = FormTokenInputSelectTokenButton;
FormTokenInput.SelectTokenModal = FormTokenInputSelectTokenModal;

interface FormTokenInputProps {
  amountFormId: string;
  tokenFormId: string;
  assetListAccountId: string;
  balanceAccountId: string;
  form: UseFormReturn<any>;
  initialSelectedTokenId?: string;
  currentAmount: string;
  isInvalid: boolean;
  errorMessage: string | undefined;
}

export function FormTokenInput(props: FormTokenInputProps) {
  const {
    amountFormId,
    tokenFormId,
    assetListAccountId,
    balanceAccountId,
    form,
    initialSelectedTokenId,
    currentAmount,
    isInvalid,
    errorMessage,
  } = props;
  const { setValue, register, trigger, watch } = form;
  watch(amountFormId, tokenFormId);

  const [isRoundValueButtonVisible, setIsRoundValueButtonVisible] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | undefined>();
  const tokenBalanceQueryResults = useAccountTokenBalances(balanceAccountId, { tokenId: selectedToken?.tokenId });

  const { data: assetBalance } = tokenBalanceQueryResults;

  const tokenId = selectedToken?.tokenId;
  const decimals = selectedToken?.decimals;

  const tokenSymbolDisplay = selectedToken?.symbol
    ? tokenId === HBARTokenId
      ? selectedToken?.name
      : selectedToken?.symbol
    : "";

  const balance = isEmpty(tokenId) || isNil(tokenId) ? undefined : assetBalance?.[0]?.balance;
  const balanceDisplay = isNil(balance) ? "--" : String(balance);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const formTokenInputContextValue = {
    token: {
      initialSelectedTokenId,
      selectedToken,
      setSelectedToken,
      assetListAccountId,
      tokenSymbolDisplay,
      balanceDisplay,
      decimals,
    },
    form: {
      amountFormId,
      tokenFormId,
      ...form,
    },
    modal: {
      isOpen,
      onOpen,
      onClose,
    },
  };

  const { handleTokenInputChangeWithPattern } = useFormTokenInputPattern((value: string) =>
    setValue(amountFormId, value)
  );

  interface ValidateTokenInputAmountParams {
    value: string | undefined;
    balance: number | undefined;
    decimals: string | undefined;
    tokenId: string | undefined;
  }

  function validateTokenInputAmount({ value, balance, decimals, tokenId }: ValidateTokenInputAmountParams) {
    isRoundValueButtonVisible && setIsRoundValueButtonVisible(false);
    if (!tokenId) {
      return "A token must be selected.";
    }
    if (!balance || balance <= 0) {
      return "Token balance must be greater than 0.";
    }
    if (!value) {
      return "An amount is required.";
    }
    const valueAsBigNumber = BigNumber(value);
    if (valueAsBigNumber.lte(0)) {
      return "Amount must be greater than 0.";
    }
    if (valueAsBigNumber.gt(balance)) {
      return "Amount must be less than or equal to token balance.";
    }
    const maxDecimals = Number(decimals);
    if ((valueAsBigNumber.decimalPlaces() ?? 0) > maxDecimals) {
      if (maxDecimals === 0) return "Amount for this token cannot contain decimal values.";
      setIsRoundValueButtonVisible(true);
      return `Amount for this token must have less than ${maxDecimals} decimal places.`;
    }
    return true;
  }

  return (
    <FormTokenInputContext.Provider value={formTokenInputContextValue}>
      <FormInput
        inputProps={{
          id: amountFormId,
          pointerEvents: "all",
          type: "text",
          placeholder: "0.00",
          label: <FormTokenInput.Label />,
          unit: (
            <Flex alignItems="center">
              <Flex gap="0.25rem" padding="0 0.75rem">
                <FormTokenInput.HalfMaxButtons />
              </Flex>
              <Divider height="27px" orientation="vertical" borderColor={Color.Neutral._300}></Divider>
              <Flex alignItems="center">
                <FormTokenInput.SelectTokenButton />
                <FormTokenInput.SelectTokenModal />
              </Flex>
            </Flex>
          ),
          register: {
            ...register(amountFormId, {
              required: { value: true, message: "An amount is required." },
              validate: {
                validateTokenInputAmount: (value: string | undefined) =>
                  validateTokenInputAmount({ value, balance, decimals, tokenId }),
              },
              onChange: handleTokenInputChangeWithPattern,
            }),
          },
        }}
        isInvalid={isInvalid}
        errorMessage={errorMessage}
        actionButton={
          isRoundValueButtonVisible ? (
            <Button
              variant="link"
              textStyle="p xsmall regular link"
              onClick={async () => {
                const roundedAmount = BigNumber(currentAmount).dp(Number(decimals), BigNumber.ROUND_HALF_UP).toString();
                setValue(amountFormId, roundedAmount);
                await trigger(amountFormId);
              }}
            >
              Round Value
            </Button>
          ) : null
        }
      />
    </FormTokenInputContext.Provider>
  );
}
