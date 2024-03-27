import { Color, CopyTextButton, FormInput, LoadingDialog, SuccessCheckIcon, Text } from "@shared/ui-kit";
import { TransactionResponse } from "@hashgraph/sdk";
import { CreateANFTDAOForm } from "../types";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "./DAOFormContainer";
import {
  useCreateNonFungibleToken,
  useFetchAccountInfo,
  useFetchTransactionDetails,
  useHandleTransactionSuccess,
} from "@dex/hooks";
import { Button, Center, Divider, Flex, Link } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { isNil } from "ramda";
import { checkForValidAccountId, createHashScanTransactionLink } from "@dex/utils";

export function CreateTokenNFTDAOForm() {
  const {
    register,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<CreateANFTDAOForm>();

  const formValues = getValues();
  const { governance } = formValues;

  const handleTransactionSuccess = useHandleTransactionSuccess();

  const {
    data: createNFTData,
    error: createNFTError,
    isError: isCreateNFTFailed,
    isLoading: isCreateNFTLoading,
    mutateAsync: createNFT,
    reset: resetCreateNFT,
  } = useCreateNonFungibleToken(handleCreateNFTSuccess);

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
  } = useFetchTransactionDetails(createNFTData?.transactionId.toString() ?? "");

  const hashscanTransactionLink = createHashScanTransactionLink(createNFTData?.transactionId?.toString() ?? "");
  const isFormInReadOnlyMode = governance?.newNFT?.id?.length > 0;

  const isLoadingDialogOpen = isCreateNFTLoading || isGetAccountDetailsLoading || isTransactionDetailsLoading;
  const isErrorDialogOpen = isCreateNFTFailed || isGetAccountDetailsFailed || isTransactionDetailsFailed;

  function getLoadingDialogMessage(): string {
    if (isLoadingDialogOpen)
      return `Please confirm the create ${governance.newNFT.name} 
    NFT transaction in your wallet to proceed.`;
    return "";
  }

  function getErrorDialogMessage(): string {
    if (isGetAccountDetailsFailed) return getAccountDetailsError?.message;
    if (isCreateNFTFailed) return createNFTError?.message;
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
      setValue("governance.newNFT.id", transactionDetails[0].entity_id, { shouldValidate: true });
      setValue("governance.newNFT.treasuryWalletAccountId", governance.newNFT.tokenWalletAddress, {
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionDetails]);

  function handleCreateNFTSuccess(transactionResponse: TransactionResponse) {
    const message = `${governance?.newNFT?.symbol} NFT was successfully created`;
    handleTransactionSuccess(transactionResponse, message);
  }

  async function createNewToken() {
    const isCreateTokenDataValid = await trigger([
      "governance.newNFT.name",
      "governance.newNFT.symbol",
      "governance.newNFT.maxSupply",
      "governance.newNFT.tokenWalletAddress",
    ]);
    if (isCreateTokenDataValid) {
      const nftDAOFormData = formValues as CreateANFTDAOForm;
      const {
        governance: {
          newNFT: { name, symbol, maxSupply, tokenWalletAddress },
        },
      } = nftDAOFormData;

      const {
        key: { key },
      } = await getAccountDetails(undefined);

      createNFT({
        name,
        symbol,
        maxSupply,
        supplyKey: key,
        tokenWalletAddress,
      });
    }
  }
  return (
    <>
      <Flex gap="1.5rem" direction="column" width="100%">
        <DAOFormContainer>
          <Flex direction="row" gap="4">
            <FormInput<"governance.newNFT.name">
              flex="3"
              inputProps={{
                id: "governance.newNFT.name",
                flex: 3,
                label: "NFT Name",
                type: "text",
                placeholder: "Enter Name",
                isDisabled: isFormInReadOnlyMode,
                register: {
                  ...register("governance.newNFT.name", {
                    required: { value: true, message: "NFT name is required." },
                  }),
                },
              }}
              isInvalid={Boolean(errors.governance?.newNFT?.name)}
              errorMessage={errors.governance?.newNFT?.name && errors.governance?.newNFT?.name.message}
            />
            <Center height="4rem">
              <Divider orientation="vertical" />
            </Center>
            <FormInput<"governance.newNFT.symbol">
              flex="2"
              inputProps={{
                flex: 2,
                id: "governance.newNFT.symbol",
                label: "NFT Symbol",
                type: "text",
                placeholder: "Enter NFT Symbol",
                isDisabled: isFormInReadOnlyMode,
                register: {
                  ...register("governance.newNFT.symbol", {
                    required: { value: true, message: "A token symbol is required." },
                  }),
                },
              }}
              isInvalid={Boolean(errors.governance?.newNFT?.symbol)}
              errorMessage={errors.governance?.newNFT?.symbol && errors.governance?.newNFT?.symbol.message}
            />
          </Flex>
          <FormInput<"governance.newNFT.maxSupply">
            inputProps={{
              id: "governance.newNFT.maxSupply",
              label: "Max supply",
              type: "number",
              placeholder: "Enter Max Supply",
              isDisabled: isFormInReadOnlyMode,
              register: {
                ...register("governance.newNFT.maxSupply", {
                  required: { value: true, message: "Max supply is required." },
                  validate: (value) => value >= 0 || "Invalid max supply.",
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.newNFT?.maxSupply)}
            errorMessage={errors.governance?.newNFT?.maxSupply && errors.governance?.newNFT?.maxSupply?.message}
          />
          <FormInput<"governance.newNFT.tokenWalletAddress">
            inputProps={{
              id: "governance.newNFT.tokenWalletAddress",
              label: "Token account (wallet address)",
              type: "text",
              placeholder: "Enter account (wallet address)",
              isDisabled: isFormInReadOnlyMode,
              register: {
                ...register("governance.newNFT.tokenWalletAddress", {
                  required: { value: true, message: "Token account (wallet address) is required." },
                  validate: (value) =>
                    checkForValidAccountId(value) || "Invalid account, please, enter a different one.",
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.newNFT?.tokenWalletAddress)}
            errorMessage={
              errors.governance?.newNFT?.tokenWalletAddress && errors.governance?.newNFT?.tokenWalletAddress?.message
            }
          />
          <Flex gap="4" justifyContent="flex-end">
            <Button key="create-token" onClick={createNewToken} isDisabled={isFormInReadOnlyMode}>
              Create New NFT
            </Button>
          </Flex>
          {isFormInReadOnlyMode ? (
            <Flex justifyContent="space-between">
              <Flex direction="column" gap="2">
                <Text.P_Small_Medium>Token ID</Text.P_Small_Medium>
                <Flex gap="2" alignItems="center">
                  <Text.P_Medium_Regular>{governance.newNFT.id}</Text.P_Medium_Regular>
                  <CopyTextButton onClick={handleCopyTextButtonTapped} />
                </Flex>
              </Flex>
              <Flex direction="column" gap="2" alignItems="flex-end">
                <Flex alignItems="center" gap="1">
                  <SuccessCheckIcon boxSize="4" />
                  <Text.P_Small_Medium> {governance.newNFT.symbol} token was successfully created.</Text.P_Small_Medium>
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
          <FormInput<"governance.newNFT.treasuryWalletAccountId">
            inputProps={{
              id: "governance.newNFT.treasuryWalletAccountId",
              label: "Treasury wallet account id",
              type: "text",
              placeholder: "Enter wallet account id",
              register: {
                ...register("governance.newNFT.treasuryWalletAccountId", {
                  required: { value: true, message: "A treasury account id is required." },
                  validate: (value) =>
                    checkForValidAccountId(value) || "Invalid account, please, enter a different one.",
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.newNFT?.treasuryWalletAccountId)}
            errorMessage={
              errors.governance?.newNFT?.treasuryWalletAccountId &&
              errors.governance?.newNFT?.treasuryWalletAccountId.message
            }
          />
        </DAOFormContainer>
      </Flex>
      <LoadingDialog isOpen={isLoadingDialogOpen} message={loadingDialogMessage} />
      <LoadingDialog
        isOpen={isErrorDialogOpen}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        message={errorDialogMessage}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            resetCreateNFT();
            resetGetAccountDetails();
          },
        }}
      />
    </>
  );
}
