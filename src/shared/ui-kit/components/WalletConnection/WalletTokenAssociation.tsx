import { useState } from "react";
import { Flex, Divider, CircularProgress, Button } from "@chakra-ui/react";
import { Color } from "../../themes";
import { CancelledStepIcon, CheckCircleIcon, FormInput, AlertDialog } from "../";
import { useForm } from "react-hook-form";
import { useAssociateToken, useHandleTransactionSuccess, useFetchTokenData, useTokenBalance } from "@dex/hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { checkForValidTokenId } from "@dex/utils";
import { MirrorNodeTokenById, DEBOUNCE_TIME } from "@dex/services";
import { debounce } from "ts-debounce";
import { isNil, isNotNil } from "ramda";
import { Text } from "../Text";

export interface TokenAssociationFormData {
  tokenId: string;
  mirrorNodeTokenId: string | undefined;
  name: string;
  symbol: string;
  balanceInUserWallet: number | undefined;
}

export const WalletTokenAssociation = () => {
  const [dialogsOpenState, setDialogsOpenState] = useState(false);
  const tokenAssociationForm = useForm<TokenAssociationFormData>();
  const {
    watch,
    register,
    setValue,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = tokenAssociationForm;
  watch(["tokenId", "mirrorNodeTokenId", "balanceInUserWallet"]);
  const { tokenId, name: tokenName, symbol, mirrorNodeTokenId, balanceInUserWallet } = getValues();
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const associateToken = useAssociateToken(handleAssociateTokenSuccess);

  async function onSubmit() {
    associateToken.mutate({ tokenId });
  }

  const { refetch, isFetching, isError } = useFetchTokenData({
    tokenId,
    handleTokenSuccessResponse,
    handleTokenErrorResponse,
  });
  const {
    data: tokenBalance,
    isLoading,
    refetch: refetchTokenBalance,
  } = useTokenBalance({
    tokenId: mirrorNodeTokenId,
    handleTokenBalanceSuccessResponse,
    handleTokenBalanceErrorResponse,
  });
  const isTokenAlreadyAssociated = isNotNil(balanceInUserWallet);
  const isTokenNotAssociated = !isTokenAlreadyAssociated && isNotNil(mirrorNodeTokenId);
  const isInvalidTokenId = isNil(mirrorNodeTokenId);
  const isAssociateButtonDisabled = isFetching || isInvalidTokenId || isLoading || isTokenAlreadyAssociated;

  register("mirrorNodeTokenId", {
    validate: (value) => isNotNil(value) || "A valid token id is required.",
  });

  register("balanceInUserWallet", {
    validate: (value) => isNil(value) || "Token is already associated.",
  });

  function handleTokenSuccessResponse(tokenData: MirrorNodeTokenById) {
    setValue("tokenId", tokenData.data.token_id, { shouldValidate: true });
    setValue("name", tokenData.data.name);
    setValue("symbol", tokenData.data.symbol);
    setValue("mirrorNodeTokenId", tokenData?.data.token_id, { shouldValidate: true });
    trigger(["mirrorNodeTokenId"]);
    refetchTokenBalance();
  }

  function handleTokenErrorResponse() {
    setValue("mirrorNodeTokenId", undefined, { shouldValidate: true });
    setValue("name", "");
    setValue("symbol", "");
    trigger(["balanceInUserWallet"]);
  }

  function resetForm() {
    reset();
  }

  function handleTokenBalanceSuccessResponse(data: number | undefined) {
    setValue("balanceInUserWallet", data, { shouldValidate: true });
    trigger(["balanceInUserWallet"]);
  }

  function handleTokenBalanceErrorResponse() {
    trigger(["balanceInUserWallet"]);
  }

  async function handleTokenIdChange(value: string) {
    if (checkForValidTokenId(value)) {
      refetch();
    }
  }

  function handleAssociateTokenSuccess(transactionResponse: TransactionResponse) {
    const message = `Successfully Associated ${mirrorNodeTokenId} to the wallet.`;
    handleTransactionSuccess(transactionResponse, message);
  }

  function getIconForTokenIdField() {
    if (isFetching) return <CircularProgress isIndeterminate color={Color.Primary._500} size="1.5rem" />;
    if (isError) return <CancelledStepIcon boxSize="4" color={Color.Destructive._500} />;
    if (isNotNil(tokenBalance)) return <CancelledStepIcon boxSize="4" color={Color.Destructive._500} />;
    if (isTokenNotAssociated) {
      return <CheckCircleIcon color={Color.Success._500} />;
    }
    return undefined;
  }

  function isInvalidTokenInputField() {
    return Boolean(errors?.mirrorNodeTokenId) || Boolean(errors?.balanceInUserWallet);
  }

  function getFieldErrorMessage() {
    if (errors?.mirrorNodeTokenId) return errors?.mirrorNodeTokenId?.message;
    if (errors?.balanceInUserWallet) return errors?.balanceInUserWallet?.message;
    return "";
  }
  return (
    <form>
      <AlertDialog
        title={"Associate token"}
        size={["xl"]}
        dialogWidth="30rem"
        openModalComponent={
          <Button key="associate-token" variant="ternary" width="11rem">
            Associate Token
          </Button>
        }
        openDialogButtonText="Associate Token"
        body={
          <>
            <Divider />
            <Flex direction="column" gap="1rem" padding="0rem 1rem" paddingTop="1rem">
              <FormInput<"tokenId">
                inputProps={{
                  id: "tokenId",
                  label: "Token",
                  type: "text",
                  placeholder: "Enter Token ID",
                  unit: getIconForTokenIdField(),
                  register: {
                    ...register("tokenId", {
                      onChange: debounce(handleTokenIdChange, DEBOUNCE_TIME),
                    }),
                  },
                }}
                isInvalid={isInvalidTokenInputField()}
                errorMessage={getFieldErrorMessage()}
              />
              {tokenName && symbol ? (
                <Flex direction="row" flex="1" paddingTop="0.6rem" paddingBottom="0.6rem">
                  <Flex direction="column" flex="3">
                    <Text.P_Small_Medium>Name</Text.P_Small_Medium>
                    <Text.P_Medium_Regular>{tokenName}</Text.P_Medium_Regular>
                  </Flex>
                  <Flex direction="row" flex="1" alignItems="flex-start" gap="4rem">
                    <Divider orientation="vertical" />
                    <Flex direction="column">
                      <Text.P_Small_Medium>Symbol</Text.P_Small_Medium>
                      <Text.P_Medium_Regular>{symbol}</Text.P_Medium_Regular>
                    </Flex>
                  </Flex>
                </Flex>
              ) : undefined}
              <Flex direction="row" gap="1rem" width="100%" justifyContent="space-between">
                <Button
                  width="12rem"
                  variant="primary"
                  onClick={() => {
                    resetForm();
                    setDialogsOpenState(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  width="12rem"
                  type="submit"
                  variant="primary"
                  onClick={onSubmit}
                  isDisabled={isAssociateButtonDisabled}
                >
                  Associate Token
                </Button>
              </Flex>
            </Flex>
          </>
        }
        alertDialogOpen={dialogsOpenState}
        onAlertDialogOpen={() => {
          setDialogsOpenState(true);
        }}
        onAlertDialogClose={() => {
          resetForm();
          setDialogsOpenState(false);
        }}
      />
    </form>
  );
};
