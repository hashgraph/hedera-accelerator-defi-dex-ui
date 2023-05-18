import { Text, Flex, Divider, Center, Button, Spacer } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { CreateATokenDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { Notification, FormInput, NotficationTypes, useNotification, LoadingDialog, Color } from "@dex-ui-components";
import { useCreateToken, useFetchAccountInfo, useFetchTransactionDetails } from "@hooks";
import { WarningIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { isNil } from "ramda";

export function CreateTokenDAOGovernanceForm() {
  const {
    getValues,
    register,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<CreateATokenDAOForm>();
  const formValues = getValues();
  const { governance } = formValues;
  const createToken = useCreateToken(handleCreateTokenSuccessful);
  const accountInfo = useFetchAccountInfo();
  const supplyKey = accountInfo.data?.key.key ?? "";
  const { data: tokenData, error, reset } = createToken;

  const isFormInReadOnlyMode = governance?.newToken?.id?.length > 0;

  const {
    data: transactionDetails,
    isLoading: isTransactionDetailsLoading,
    isError: isTransactionDetailsFailed,
    error: transactionDetailsError,
  } = useFetchTransactionDetails(tokenData?.transactionId.toString() ?? "");

  const {
    setIsNotificationVisible,
    isSuccessNotificationVisible,
    successNotificationMessage,
    hashscanTransactionLink,
    handleCloseNotificationButtonClicked,
  } = useNotification({
    successMessage: `${governance?.newToken?.symbol} token was successfully created`,
    transactionState: {
      transactionWaitingToBeSigned: false,
      successPayload: tokenData ?? null,
      errorMessage: error?.message ?? "",
    },
  });

  const isLoadingDialogOpen = createToken.isLoading || accountInfo.isLoading || isTransactionDetailsLoading;
  const isErrorDialogOpen = createToken.isError || accountInfo.isError || isTransactionDetailsFailed;

  function getLoadingDialogMessage(): string {
    if (createToken.isLoading || isTransactionDetailsLoading)
      return `Please confirm the create ${governance.newToken.name} 
      token transaction in your wallet to proceed.`;
    if (accountInfo.isLoading) return "Please wait while we get your account public key";
    return "";
  }

  function getErrorDialogMessage(): string {
    if (accountInfo.isError) return accountInfo.error?.message;
    if (createToken.isError) return createToken.error?.message;
    if (isTransactionDetailsFailed) return transactionDetailsError?.message;
    return "";
  }

  const loadingDialogMessage = getLoadingDialogMessage();
  const errorDialogMessage = getErrorDialogMessage();

  useEffect(() => {
    if (supplyKey) {
      setValue("governance.newToken.supplyKey", supplyKey, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplyKey]);

  useEffect(() => {
    if (!isNil(transactionDetails)) {
      setValue("governance.newToken.id", transactionDetails[0].token_transfers[0].token_id, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionDetails]);

  function handleCreateTokenSuccessful() {
    setIsNotificationVisible(true);
  }

  function handleGetAccountInfoClick() {
    accountInfo.mutate(undefined);
  }

  async function createNewToken() {
    const isCreateTokenDataValid = await trigger([
      "governance.newToken.name",
      "governance.newToken.symbol",
      "governance.newToken.decimals",
      "governance.newToken.initialSupply",
      "governance.newToken.supplyKey",
      "governance.newToken.treasuryWalletAccountId",
    ]);
    if (isCreateTokenDataValid) {
      const tokenDAOFormData = formValues as CreateATokenDAOForm;
      const {
        governance: {
          newToken: { name, symbol, initialSupply, decimals, treasuryWalletAccountId, supplyKey },
        },
      } = tokenDAOFormData;
      createToken.mutate({
        name,
        symbol,
        initialSupply,
        supplyKey,
        decimals,
        treasuryAccountId: treasuryWalletAccountId,
      });
    }
  }

  return (
    <>
      {isSuccessNotificationVisible && (
        <>
          <Notification
            type={NotficationTypes.SUCCESS}
            textStyle="b3"
            message={successNotificationMessage}
            isLinkShown={true}
            linkText="View in HashScan"
            linkRef={hashscanTransactionLink}
            isCloseButtonShown={true}
            handleClickClose={handleCloseNotificationButtonClicked}
          />
          <Spacer paddingBottom="1.5rem" />
        </>
      )}
      <Flex gap="1.5rem" direction="column">
        <DAOFormContainer>
          <FormInput<"governance.newToken.id">
            inputProps={{
              id: "governance.newToken.id",
              label: "Token ID",
              type: "text",
              placeholder: "Token Id",
              isReadOnly: true,
              register: {
                ...register("governance.newToken.id", {
                  required: { value: true, message: "A token id is required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.newToken?.id)}
            errorMessage={errors.governance?.newToken?.id && errors.governance?.newToken?.id.message}
          />
        </DAOFormContainer>
        <DAOFormContainer>
          <Flex direction="row" gap="4">
            <FormInput<"governance.newToken.name">
              flex="3"
              inputProps={{
                id: "governance.newToken.name",
                label: "Name",
                type: "text",
                placeholder: "Enter token name",
                isReadOnly: isFormInReadOnlyMode,
                register: {
                  ...register("governance.newToken.name", {
                    required: { value: true, message: "A token name is required." },
                  }),
                },
              }}
              isInvalid={Boolean(errors.governance?.newToken?.name)}
              errorMessage={errors.governance?.newToken?.name && errors.governance?.newToken?.name.message}
            />
            <Center height="64px">
              <Divider orientation="vertical" />
            </Center>
            <FormInput<"governance.newToken.symbol">
              flex="2"
              inputProps={{
                flex: 2,
                id: "governance.newToken.symbol",
                label: "Symbol",
                type: "text",
                isReadOnly: isFormInReadOnlyMode,
                placeholder: "Enter Symbol",
                register: {
                  ...register("governance.newToken.symbol", {
                    required: { value: true, message: "A token symbol is required." },
                  }),
                },
              }}
              isInvalid={Boolean(errors.governance?.newToken?.symbol)}
              errorMessage={errors.governance?.newToken?.symbol && errors.governance?.newToken?.symbol.message}
            />
            <Center height="64px">
              <Divider orientation="vertical" />
            </Center>
            <FormInput<"governance.newToken.decimals">
              flex="1"
              inputProps={{
                flex: 1,
                id: "governance.newToken.decimals",
                label: "Decimals",
                type: "number",
                placeholder: "",
                isReadOnly: true,
                register: {
                  ...register("governance.newToken.decimals", {
                    required: { value: true, message: "Decimals are required." },
                  }),
                },
              }}
              isInvalid={Boolean(errors.governance?.newToken?.decimals)}
              errorMessage={errors.governance?.newToken?.decimals && errors.governance?.newToken?.decimals.message}
            />
          </Flex>
          <FormInput<"governance.newToken.logo">
            inputProps={{
              id: "governance.newToken.logo",
              label: "Logo",
              type: "text",
              isReadOnly: isFormInReadOnlyMode,
              placeholder: "Enter image URL",
              register: {
                ...register("governance.newToken.logo", {
                  required: { value: true, message: "A token logo is required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.newToken?.logo)}
            errorMessage={errors.governance?.newToken?.logo && errors.governance?.newToken?.logo.message}
          />
          <FormInput<"governance.newToken.initialSupply">
            inputProps={{
              id: "governance.newToken.initialSupply",
              label: "Initial token supply",
              type: "number",
              placeholder: "Enter amount",
              unit: "$TOKEN",
              isReadOnly: isFormInReadOnlyMode,
              register: {
                ...register("governance.newToken.initialSupply", {
                  required: { value: true, message: "An initial token supply is required." },
                }),
              },
            }}
            formHelperText="If not specified, can be unlimited"
            isInvalid={Boolean(errors.governance?.newToken?.initialSupply)}
            errorMessage={
              errors.governance?.newToken?.initialSupply && errors.governance?.newToken?.initialSupply.message
            }
          />
          <Flex direction="row" gap="4" alignItems="flex-end">
            <FormInput<"governance.newToken.supplyKey">
              flex="5"
              inputProps={{
                flex: 5,
                id: "governance.newToken.supplyKey",
                label: "Supply Key",
                type: "text",
                isReadOnly: true,
                placeholder: "Enter Supply Key",
                register: {
                  ...register("governance.newToken.supplyKey", {
                    required: { value: true, message: "Supply key is required." },
                  }),
                },
              }}
              isInvalid={Boolean(errors.governance?.newToken?.supplyKey)}
              errorMessage={errors.governance?.newToken?.supplyKey && errors.governance?.newToken?.supplyKey?.message}
            />
            <Button key="token-supply-key" onClick={handleGetAccountInfoClick} flex="1" marginBottom="8px">
              Get Supply Key
            </Button>
          </Flex>
        </DAOFormContainer>
        <Text textStyle="p large regular">Initial token distribution</Text>
        <DAOFormContainer>
          <FormInput<"governance.newToken.treasuryWalletAccountId">
            inputProps={{
              id: "governance.newToken.treasuryWalletAccountId",
              label: "Treasury wallet account id",
              type: "text",
              placeholder: "Enter wallet account id",
              isReadOnly: isFormInReadOnlyMode,
              register: {
                ...register("governance.newToken.treasuryWalletAccountId", {
                  required: { value: true, message: "A treasury account id is required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.newToken?.treasuryWalletAccountId)}
            errorMessage={
              errors.governance?.newToken?.treasuryWalletAccountId &&
              errors.governance?.newToken?.treasuryWalletAccountId.message
            }
          />
        </DAOFormContainer>
        <Flex gap="4" justifyContent="flex-end">
          <Button key="create-token" onClick={createNewToken}>
            Create Token
          </Button>
        </Flex>
      </Flex>
      <LoadingDialog isOpen={isLoadingDialogOpen} message={loadingDialogMessage} />
      <LoadingDialog
        isOpen={isErrorDialogOpen}
        message={errorDialogMessage}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            reset();
            accountInfo.reset();
          },
        }}
      />
    </>
  );
}
