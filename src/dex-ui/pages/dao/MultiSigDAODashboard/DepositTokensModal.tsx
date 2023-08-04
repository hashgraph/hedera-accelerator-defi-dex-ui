import { Button, Divider, Flex, Text } from "@chakra-ui/react";
import {
  Color,
  FormDropdown,
  FormTokenInput,
  NewTokenIcon,
  useFormTokenInputPattern,
  useHalfMaxButtons,
} from "@dex-ui-components";
import { TokenBalance, useAccountTokenBalances, useDexContext } from "@hooks";
import { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { HBARTokenId, HBARSymbol } from "@services";
import BigNumber from "bignumber.js";

interface DepositTokensModalBodyProps {
  safeId: string;
  handleDepositClicked: (data: DepositTokensFormData) => void;
  handleCancelClicked: () => void;
  handleAssociateTokenClicked: () => void;
}

export interface DepositTokensFormData {
  tokenId: string;
  amount: string | undefined;
  decimals: number;
}

const DepositTokensModal = (props: DepositTokensModalBodyProps) => {
  const { safeId, handleDepositClicked, handleCancelClicked, handleAssociateTokenClicked } = props;
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const {
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<DepositTokensFormData>();
  watch("tokenId");
  const accountTokenBalancesQueryResults = useAccountTokenBalances(safeId ?? "");
  const { data: tokenBalances } = accountTokenBalancesQueryResults;

  const walletTokenBalancesQueryResults = useAccountTokenBalances(wallet.savedPairingData?.accountIds[0] ?? "");
  const { data: walletBalances } = walletTokenBalancesQueryResults;
  const assetDropdownOptions =
    tokenBalances?.map((asset: TokenBalance) => {
      const { symbol, tokenId } = asset;
      if (symbol === HBARSymbol) {
        return {
          label: symbol,
          value: HBARTokenId,
        };
      }
      return {
        label: symbol,
        value: tokenId,
      };
    }) ?? [];

  async function onSubmit(data: DepositTokensFormData) {
    handleDepositClicked(data);
  }

  const selectedAsset = getValues().tokenId
    ? walletBalances?.find(
        (asset: TokenBalance) =>
          asset.tokenId === getValues().tokenId || (getValues().tokenId === HBARTokenId && asset.symbol === HBARSymbol)
      )
    : undefined;

  function validateAmount(value: string | undefined) {
    if (!value) {
      return "An amount is required.";
    }
    const valueAsBigNumber = BigNumber(value);
    const tokenId = getValues().tokenId;
    const selectedAsset = walletBalances?.find(
      (asset: TokenBalance) => asset.tokenId === tokenId || (tokenId === HBARTokenId && asset.symbol === HBARSymbol)
    );
    if (!selectedAsset?.balance || selectedAsset?.balance <= 0) {
      return "Token balance must be greater than 0.";
    }
    if (valueAsBigNumber.gt(selectedAsset?.balance)) {
      return "Amount must be less than or equal to token balance.";
    }
    if (valueAsBigNumber.lte(0)) {
      return "Amount must be greater than 0.";
    }
    if (!tokenId) {
      return "A token must be selected.";
    }
    return true;
  }

  const { handleMaxButtonClicked, handleHalfButtonClicked } = useHalfMaxButtons(
    String(selectedAsset?.balance ?? 0),
    (amount: string | undefined) => setValue("amount", amount)
  );

  const { handleTokenInputChangeWithPattern } = useFormTokenInputPattern((value: string) => setValue("amount", value));

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap={4}>
        <Divider marginX={-5} paddingX={5} />
        <FormDropdown
          label="Assets"
          placeholder="Select a token"
          data={assetDropdownOptions}
          isInvalid={Boolean(errors?.tokenId)}
          errorMessage={errors?.tokenId && errors?.tokenId?.message}
          register={register("tokenId", {
            required: { value: true, message: "A token is required." },
            onChange: (e: ChangeEvent<HTMLSelectElement>) => setValue("tokenId", e.target.value),
          })}
        />
        <FormTokenInput<"amount">
          inputProps={{
            id: "amount",
            pointerEvents: "all",
            placeholder: "Enter amount",
            label: (
              <FormTokenInput.Label
                tokenSymbol={selectedAsset?.symbol ?? ""}
                balance={selectedAsset ? String(selectedAsset.balance ?? 0) : "--"}
              />
            ),
            type: "text",
            unit: (
              <FormTokenInput.RightUnitContent
                tokenSymbol={selectedAsset?.symbol}
                handleHalfButtonClicked={handleHalfButtonClicked}
                handleMaxButtonClicked={handleMaxButtonClicked}
              />
            ),
            register: {
              ...register("amount", {
                required: { value: true, message: "An amount is required." },
                validate: { validateAmount },
                onChange: handleTokenInputChangeWithPattern,
              }),
            },
          }}
          isInvalid={Boolean(errors?.amount)}
          errorMessage={errors?.amount && errors?.amount?.message}
        />
        <Flex justify="space-around" gap={4}>
          <Text textStyle="p xsmall regular">If you can't find the token you want to deposit, create a proposal</Text>
          <Button
            variant="secondary"
            onClick={handleAssociateTokenClicked}
            paddingX={4}
            leftIcon={<NewTokenIcon boxSize="4" color={Color.Neutral._400} marginTop="0.2rem" />}
            flexShrink={0}
          >
            Associate Token
          </Button>
        </Flex>
        <Flex gap="4" backgroundColor={Color.Grey_Blue._50} marginX={-5} padding={5} marginBottom={-10}>
          <Button flex="1" variant="secondary" onClick={handleCancelClicked}>
            Cancel
          </Button>
          <Button flex="1" type="submit">
            Deposit Fund
          </Button>
        </Flex>
      </Flex>
    </form>
  );
};

export { DepositTokensModal };
