import { Button, Divider, Flex, Text } from "@chakra-ui/react";
import { FormTokenInput, Color, NewTokenIcon } from "@shared/ui-kit";
import { usePairedWalletDetails } from "@dex/hooks";
import { useForm } from "react-hook-form";

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

export function DepositTokensModal(props: DepositTokensModalBodyProps) {
  const { safeId, handleDepositClicked, handleCancelClicked, handleAssociateTokenClicked } = props;
  const { walletId } = usePairedWalletDetails();
  const form = useForm<DepositTokensFormData>();
  const {
    handleSubmit,
    getValues,
    formState: { errors },
  } = form;

  async function onSubmit(data: DepositTokensFormData) {
    handleDepositClicked(data);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap={4}>
        <Divider marginX={-5} paddingX={5} />
        <FormTokenInput
          amountFormId="amount"
          tokenFormId="tokenId"
          assetListAccountId={safeId}
          balanceAccountId={walletId ?? ""}
          currentAmount={getValues().amount ?? ""}
          form={form}
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
}
