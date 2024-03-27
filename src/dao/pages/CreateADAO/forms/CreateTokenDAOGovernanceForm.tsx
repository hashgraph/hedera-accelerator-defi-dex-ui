import { Button, Center, Divider, Flex, Link } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { TransactionResponse } from "@hashgraph/sdk";
import { CreateATokenDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { Color, CopyTextButton, FormInput, LoadingDialog, SuccessCheckIcon, Text } from "@shared/ui-kit";
import {
  useCreateToken,
  useFetchAccountInfo,
  useFetchTransactionDetails,
  useHandleTransactionSuccess,
} from "@dex/hooks";
import { WarningIcon } from "@chakra-ui/icons";
import { ChangeEvent, useEffect, useState } from "react";
import { isNil, isNotNil } from "ramda";
import { checkForValidAccountId, createHashScanTransactionLink } from "@dex/utils";
import { DefaultCreateATokenDAOFormData } from "@dao/pages";

export function CreateTokenDAOGovernanceForm() {
  const {
    getValues,
    register,
    trigger,
    setValue,
    formState: { errors },
  } = useFormContext<CreateATokenDAOForm>();
  const formValues = getValues();
  const { governance } = isNotNil(formValues.governance) ? formValues : DefaultCreateATokenDAOFormData;
  const [tokenSymbol, setTokenSymbol] = useState("");

  const handleTransactionSuccess = useHandleTransactionSuccess();

  const {
    data: createTokenData,
    error: createTokenError,
    isError: isCreateTokenFailed,
    isLoading: isCreateTokenLoading,
    mutateAsync: createToken,
    reset: resetCreateToken,
  } = useCreateToken(handleCreateTokenSuccess);

  const {
    mutateAsync: getAccountDetails,
    isLoading: isGetAccountDetailsLoading,
    isError: isGetAccountDetailsFailed,
    error: getAccountDetailsError,
    reset: resetGetAccountDetails,
  } = useFetchAccountInfo();

  const {
    data: transactionDetails,
    isLoading: isTransactionDetailsLoading,
    isError: isTransactionDetailsFailed,
    error: transactionDetailsError,
  } = useFetchTransactionDetails(createTokenData?.transactionId.toString() ?? "");

  const hashscanTransactionLink = createHashScanTransactionLink(createTokenData?.transactionId?.toString() ?? "");
  const isFormInReadOnlyMode = governance?.newToken?.id?.length > 0;

  const isLoadingDialogOpen = isCreateTokenLoading || isGetAccountDetailsLoading || isTransactionDetailsLoading;
  const isErrorDialogOpen = isCreateTokenFailed || isGetAccountDetailsFailed || isTransactionDetailsFailed;

  function getLoadingDialogMessage(): string {
    if (isLoadingDialogOpen)
      return `Please confirm the create ${governance.newToken.name} 
      token transaction in your account to proceed.`;
    return "";
  }

  function getErrorDialogMessage(): string {
    if (isGetAccountDetailsFailed) return getAccountDetailsError?.message;
    if (isCreateTokenFailed) return createTokenError?.message;
    if (isTransactionDetailsFailed) return transactionDetailsError?.message;
    return "";
  }

  function handleCopyTextButtonTapped() {
    console.log("Copy the text to clipboard");
  }

  const loadingDialogMessage = getLoadingDialogMessage();
  const errorDialogMessage = getErrorDialogMessage();

  useEffect(() => {
    if (!isNil(transactionDetails)) {
      setValue("governance.newToken.id", transactionDetails[0].token_transfers[0].token_id, { shouldValidate: true });
      setValue("governance.newToken.treasuryWalletAccountId", governance.newToken.tokenWalletAddress, {
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionDetails]);

  function handleCreateTokenSuccess(transactionResponse: TransactionResponse) {
    const message = `${governance?.newToken?.symbol} token was successfully created`;
    handleTransactionSuccess(transactionResponse, message);
  }

  async function createNewToken() {
    const isCreateTokenDataValid = await trigger([
      "governance.newToken.name",
      "governance.newToken.symbol",
      "governance.newToken.decimals",
      "governance.newToken.initialSupply",
      "governance.newToken.tokenWalletAddress",
    ]);
    if (isCreateTokenDataValid) {
      const tokenDAOFormData = formValues as CreateATokenDAOForm;
      const {
        governance: {
          newToken: { name, symbol, initialSupply, decimals, tokenWalletAddress },
        },
      } = tokenDAOFormData;

      const {
        key: { key },
      } = await getAccountDetails(undefined);

      createToken({
        name,
        symbol,
        initialSupply,
        supplyKey: key,
        decimals,
        tokenWalletAddress,
      });
    }
  }

  return (
    <>
      <Flex gap="1.5rem" direction="column">
        <DAOFormContainer>
          <Text.P_Small_Medium paddingBottom="0.4rem">
            To generate the token ID, define the following inputs. Once the token is created, the token&apos;s ID will
            be automatically displayed.
          </Text.P_Small_Medium>
          <Flex direction="row" gap="4">
            <FormInput<"governance.newToken.name">
              flex="3"
              inputProps={{
                id: "governance.newToken.name",
                label: "Name",
                type: "text",
                placeholder: "Enter token name",
                isDisabled: isFormInReadOnlyMode,
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
                isDisabled: isFormInReadOnlyMode,
                placeholder: "Enter Symbol",
                register: {
                  ...register("governance.newToken.symbol", {
                    required: { value: true, message: "A token symbol is required." },
                    onChange: (event: ChangeEvent<HTMLInputElement>) => {
                      const inputElement = event?.target as HTMLInputElement;
                      setTokenSymbol(inputElement.value);
                    },
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
                value: `${governance.newToken.decimals}`,
                placeholder: "",
                isDisabled: true,
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
              isDisabled: isFormInReadOnlyMode,
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
              unit: tokenSymbol,
              isDisabled: isFormInReadOnlyMode,
              register: {
                ...register("governance.newToken.initialSupply", {
                  required: { value: true, message: "An initial token supply is required." },
                  validate: (value) => value >= 0 || "Invalid initial token supply.",
                }),
              },
            }}
            formHelperText="If not specified, can be unlimited"
            isInvalid={Boolean(errors.governance?.newToken?.initialSupply)}
            errorMessage={
              errors.governance?.newToken?.initialSupply && errors.governance?.newToken?.initialSupply.message
            }
          />
          <FormInput<"governance.newToken.tokenWalletAddress">
            flex="3"
            inputProps={{
              id: "governance.newToken.tokenWalletAddress",
              label: "Token Account(wallet address)",
              type: "text",
              placeholder: "Enter account (wallet address)",
              isDisabled: isFormInReadOnlyMode,
              register: {
                ...register("governance.newToken.tokenWalletAddress", {
                  required: { value: true, message: "Token account (wallet address) is required." },
                  validate: (value) =>
                    checkForValidAccountId(value) || "Invalid account, please, enter a different one.",
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.newToken?.tokenWalletAddress)}
            errorMessage={
              errors.governance?.newToken?.tokenWalletAddress && errors.governance?.newToken?.tokenWalletAddress.message
            }
          />
          <Flex gap="4" justifyContent="flex-end">
            {errors.governance?.newToken?.id ? (
              <Flex gap="1" alignItems="top" direction="row">
                <WarningIcon color={Color.Destructive._500} marginTop="0.3rem" boxSize="3" />
                <Text.P_Small_Regular color={Color.Destructive._500}>
                  {errors.governance?.newToken?.id?.message}
                </Text.P_Small_Regular>
              </Flex>
            ) : undefined}
            <Button key="create-token" onClick={createNewToken} isDisabled={isFormInReadOnlyMode}>
              Create Token
            </Button>
          </Flex>
          {isFormInReadOnlyMode ? (
            <Flex justifyContent="space-between">
              <Flex direction="column" gap="2">
                <Text.P_Small_Medium>Token ID</Text.P_Small_Medium>
                <Flex gap="2" alignItems="center">
                  <Text.P_Medium_Regular>{governance.newToken.id}</Text.P_Medium_Regular>
                  <CopyTextButton onClick={handleCopyTextButtonTapped} />
                </Flex>
              </Flex>
              <Flex direction="column" gap="2" alignItems="flex-end">
                <Flex alignItems="center" gap="1">
                  <SuccessCheckIcon boxSize="4" />
                  <Text.P_Small_Medium>
                    {governance.newToken.symbol} token was successfully created.
                  </Text.P_Small_Medium>
                </Flex>
                {hashscanTransactionLink && (
                  <Link href={hashscanTransactionLink} isExternal flexDirection="row">
                    <Text.P_Small_Semibold color={Color.Primary._500}>View in HashScan</Text.P_Small_Semibold>
                  </Link>
                )}
              </Flex>
            </Flex>
          ) : undefined}
        </DAOFormContainer>
        <Text.P_Large_Regular>Initial token distribution</Text.P_Large_Regular>
        <DAOFormContainer>
          <FormInput<"governance.newToken.treasuryWalletAccountId">
            inputProps={{
              id: "governance.newToken.treasuryWalletAccountId",
              label: "Treasury account (wallet address)",
              type: "text",
              placeholder: "Enter account (wallet address)",
              register: {
                ...register("governance.newToken.treasuryWalletAccountId", {
                  required: { value: true, message: "A treasury account id is required." },
                  validate: (value) =>
                    checkForValidAccountId(value) || "Invalid account, please, enter a different one.",
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
      </Flex>
      <LoadingDialog isOpen={isLoadingDialogOpen} message={loadingDialogMessage} />
      <LoadingDialog
        isOpen={isErrorDialogOpen}
        message={errorDialogMessage}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            resetCreateToken();
            resetGetAccountDetails();
          },
        }}
      />
    </>
  );
}
