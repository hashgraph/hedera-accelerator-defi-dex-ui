import { useState } from "react";
import { Text, Flex, Divider, CircularProgress } from "@chakra-ui/react";
import { AlertDialog, Button, CancelledStepIcon, CheckCircleIcon, Color, FormInput } from "@dex-ui-components";
import { useForm } from "react-hook-form";
import { useAssociateToken, useHandleTransactionSuccess, useFetchTokenData } from "@hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { checkForValidTokenId } from "@utils";
import { MirrorNodeTokenById, DEBOUNCE_TIME } from "@services";
import { debounce } from "ts-debounce";
import { isNil, isNotNil } from "ramda";

export interface TokenAssociationFormData {
  tokenId: string;
  mirrorNodeTokenId: string | undefined;
  name: string;
  symbol: string;
}

export const WalletTokenAssociation = () => {
  const [dialogsOpenState, setDialogsOpenState] = useState(false);
  const tokenAssociationForm = useForm<TokenAssociationFormData>();
  const {
    watch,
    register,
    setValue,
    reset: resetForm,
    trigger,
    getValues,
    formState: { errors },
  } = tokenAssociationForm;
  watch("tokenId", "mirrorNodeTokenId");
  register("mirrorNodeTokenId", {
    required: { value: true, message: "A valid token id is required." },
    validate: (value) => isNotNil(value) || "Invalid Token id",
  });
  const { tokenId, name: tokenName, symbol, mirrorNodeTokenId } = getValues();
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const associateToken = useAssociateToken(handleAssociateTokenSuccess);

  async function onSubmit() {
    associateToken.mutate({ tokenId });
  }

  const { refetch, isFetching, isSuccess, isError } = useFetchTokenData({
    tokenId,
    handleTokenSuccessResponse,
    handleTokenErrorResponse,
  });
  const disableAssociateButton = isError || isFetching || isNil(mirrorNodeTokenId);

  function handleTokenSuccessResponse(tokenData: MirrorNodeTokenById) {
    setValue("tokenId", tokenData.data.token_id, { shouldValidate: true });
    setValue("name", tokenData.data.name);
    setValue("symbol", tokenData.data.symbol);
    setValue("mirrorNodeTokenId", tokenData?.data.token_id, { shouldValidate: true });
    trigger(["mirrorNodeTokenId"]);
  }

  function handleTokenErrorResponse() {
    setValue("mirrorNodeTokenId", undefined, { shouldValidate: true });
    setValue("name", "");
    setValue("symbol", "");
    trigger(["mirrorNodeTokenId"]);
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
    if (isSuccess && tokenId?.length > 0) {
      return <CheckCircleIcon color={Color.Success._500} />;
    }
    return undefined;
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
                  placeholder: "Enter Token Id.",
                  unit: getIconForTokenIdField(),
                  register: {
                    ...register("tokenId", {
                      onChange: debounce(handleTokenIdChange, DEBOUNCE_TIME),
                    }),
                  },
                }}
                isInvalid={Boolean(errors?.mirrorNodeTokenId)}
                errorMessage={errors?.mirrorNodeTokenId && errors?.mirrorNodeTokenId.message}
              />
              {tokenName && symbol ? (
                <Flex direction="row" flex="1" paddingTop="0.6rem" paddingBottom="0.6rem">
                  <Flex direction="column" flex="3">
                    <Text textStyle="p small medium">Name</Text>
                    <Text textStyle="p medium regular">{tokenName}</Text>
                  </Flex>
                  <Flex direction="row" flex="1" alignItems="flex-start" gap="4rem">
                    <Divider orientation="vertical" />
                    <Flex direction="column">
                      <Text textStyle="p small medium">Symbol</Text>
                      <Text textStyle="p medium regular">{symbol}</Text>
                    </Flex>
                  </Flex>
                </Flex>
              ) : undefined}
              <Flex direction="row" gap="1rem" width="100%" justifyContent="space-between">
                <Button
                  width="12rem"
                  variant="primary"
                  onClick={() => {
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
                  isDisabled={disableAssociateButton}
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
          setDialogsOpenState(false);
          resetForm();
        }}
      />
    </form>
  );
};
