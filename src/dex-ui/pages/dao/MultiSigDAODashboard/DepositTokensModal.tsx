import { Button, Divider, Flex, Text } from "@chakra-ui/react";
import { Color, FormDropdown, FormInput, NewTokenIcon } from "@dex-ui-components";
import { TokenBalance, useAccountTokenBalances } from "@hooks";
import { ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { HBARTokenId, HBARSymbol } from "@services";

interface DepositTokensModalBodyProps {
  safeId: string;
  handleDepositClicked: (data: DepositTokensFormData) => void;
  handleCancelClicked: () => void;
  handleAssociateTokenClicked: () => void;
}

export interface DepositTokensFormData {
  tokenId: string;
  amount: number;
  decimals: number;
}

const DepositTokensModal = (props: DepositTokensModalBodyProps) => {
  const { safeId, handleDepositClicked, handleCancelClicked, handleAssociateTokenClicked } = props;
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<DepositTokensFormData>();

  const accountTokenBalancesQueryResults = useAccountTokenBalances(safeId ?? "");
  const { data: tokenBalances } = accountTokenBalancesQueryResults;
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

  function validateAmount(value: number) {
    if (value <= 0) {
      return "Amount must be greater than 0.";
    }
    return true;
  }

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
        <FormInput<"amount">
          inputProps={{
            id: "amount",
            label: "Amount",
            type: "number",
            placeholder: "Enter amount",
            register: {
              ...register("amount", {
                required: { value: true, message: "An amount is required." },
                validate: { validateAmount },
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
