import { Notification, FormInput, NotficationTypes, useNotification, LoadingDialog, Color } from "@dex-ui-components";
import { CreateANFTDAOForm } from "../types";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "./DAOFormContainer";
import { useCreateNonFungibleToken, useFetchAccountInfo, useFetchTransactionDetails } from "@hooks";
import { Button, Center, Divider, Flex, Text } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { isNil } from "ramda";
import { checkForValidAccountId } from "@utils";

export function NFTDAOGovernanceForm() {
  const {
    register,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<CreateANFTDAOForm>();

  const formValues = getValues();
  const { governance } = formValues;

  const {
    data: createNFTData,
    error: createNFTError,
    isError: isCreateNFTFailed,
    isLoading: isCreateNFTLoading,
    mutateAsync: createNFT,
    reset: resetCreateNFT,
  } = useCreateNonFungibleToken(handleCreateTokenSuccessful);

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

  const isLoadingDialogOpen = isCreateNFTLoading || isGetAccountDetailsLoading || isTransactionDetailsLoading;
  const isErrorDialogOpen = isCreateNFTFailed || isGetAccountDetailsFailed || isTransactionDetailsFailed;

  const {
    setIsNotificationVisible,
    isSuccessNotificationVisible,
    successNotificationMessage,
    hashscanTransactionLink,
    handleCloseNotificationButtonClicked,
  } = useNotification({
    successMessage: `${governance?.nft?.symbol} NFT was successfully created`,
    transactionState: {
      transactionWaitingToBeSigned: false,
      successPayload: createNFTData ?? null,
      errorMessage: createNFTError?.message ?? "",
    },
  });

  function getLoadingDialogMessage(): string {
    if (isLoadingDialogOpen)
      return `Please confirm the create ${governance.nft.name} 
    NFT transaction in your wallet to proceed.`;
    return "";
  }

  function getErrorDialogMessage(): string {
    if (isGetAccountDetailsFailed) return getAccountDetailsError?.message;
    if (isCreateNFTFailed) return createNFTError?.message;
    if (isTransactionDetailsFailed) return transactionDetailsError?.message;
    return "";
  }

  const loadingDialogMessage = getLoadingDialogMessage();
  const errorDialogMessage = getErrorDialogMessage();

  useEffect(() => {
    if (!isNil(transactionDetails)) {
      setValue("governance.nft.id", transactionDetails[0].entity_id, { shouldValidate: true });
      setValue("governance.nft.treasuryWalletAccountId", governance.nft.tokenWalletAddress, {
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionDetails]);

  function handleCreateTokenSuccessful() {
    setIsNotificationVisible(true);
  }

  async function createNewToken() {
    const isCreateTokenDataValid = await trigger([
      "governance.nft.name",
      "governance.nft.symbol",
      "governance.nft.maxSupply",
      "governance.nft.tokenWalletAddress",
    ]);
    if (isCreateTokenDataValid) {
      const nftDAOFormData = formValues as CreateANFTDAOForm;
      const {
        governance: {
          nft: { name, symbol, maxSupply, tokenWalletAddress },
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
      {isSuccessNotificationVisible && (
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
      )}
      <Flex gap="1.5rem" direction="column" width="100%">
        <DAOFormContainer>
          <FormInput<"governance.nft.id">
            inputProps={{
              id: "governance.nft.id",
              label: "NFT ID",
              type: "text",
              placeholder: "Enter NFT Id",
              register: {
                ...register("governance.nft.id", {
                  required: { value: true, message: "A NFT id is required." },
                  validate: (value) =>
                    checkForValidAccountId(value) || "Invalid address, please, enter a different one.",
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.nft?.id)}
            errorMessage={errors.governance?.nft?.id && errors.governance?.nft.id.message}
          />
        </DAOFormContainer>
        <DAOFormContainer>
          <Flex direction="row" gap="4">
            <FormInput<"governance.nft.name">
              flex="3"
              inputProps={{
                id: "governance.nft.name",
                flex: 3,
                label: "NFT Name",
                type: "text",
                placeholder: "Enter Name",
                register: {
                  ...register("governance.nft.name", {
                    required: { value: true, message: "NFT name is required." },
                  }),
                },
              }}
              isInvalid={Boolean(errors.governance?.nft?.name)}
              errorMessage={errors.governance?.nft?.name && errors.governance?.nft?.name.message}
            />
            <Center height="64px">
              <Divider orientation="vertical" />
            </Center>
            <FormInput<"governance.nft.symbol">
              flex="2"
              inputProps={{
                flex: 2,
                id: "governance.nft.symbol",
                label: "NFT Symbol",
                type: "text",
                placeholder: "Enter NFT Symbol",
                register: {
                  ...register("governance.nft.symbol", {
                    required: { value: true, message: "A token symbol is required." },
                  }),
                },
              }}
              isInvalid={Boolean(errors.governance?.nft?.symbol)}
              errorMessage={errors.governance?.nft?.symbol && errors.governance?.nft?.symbol.message}
            />
          </Flex>
          <FormInput<"governance.nft.maxSupply">
            inputProps={{
              id: "governance.nft.maxSupply",
              label: "Max supply",
              type: "number",
              placeholder: "Enter Max Supply",
              register: {
                ...register("governance.nft.maxSupply", {
                  required: { value: true, message: "Max supply is required." },
                  validate: (value) => value >= 0 || "Invalid max supply.",
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.nft?.maxSupply)}
            errorMessage={errors.governance?.nft?.maxSupply && errors.governance?.nft?.maxSupply?.message}
          />
          <FormInput<"governance.nft.tokenWalletAddress">
            inputProps={{
              id: "governance.nft.tokenWalletAddress",
              label: "Token wallet address",
              type: "text",
              placeholder: "Enter wallet address",
              register: {
                ...register("governance.nft.tokenWalletAddress", {
                  required: { value: true, message: "Token wallet address is required." },
                  validate: (value) =>
                    checkForValidAccountId(value) || "Invalid address, please, enter a different one.",
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.nft?.tokenWalletAddress)}
            errorMessage={
              errors.governance?.nft?.tokenWalletAddress && errors.governance?.nft?.tokenWalletAddress?.message
            }
          />
          <Flex gap="4" justifyContent="flex-end">
            <Button key="create-token" onClick={createNewToken}>
              Create New NFT
            </Button>
          </Flex>
        </DAOFormContainer>
        <Text textStyle="p large regular">Initial token distribution</Text>
        <DAOFormContainer>
          <FormInput<"governance.nft.treasuryWalletAccountId">
            inputProps={{
              id: "governance.nft.treasuryWalletAccountId",
              label: "Treasury wallet account id",
              type: "text",
              placeholder: "Enter wallet account id",
              register: {
                ...register("governance.nft.treasuryWalletAccountId", {
                  required: { value: true, message: "A treasury account id is required." },
                  validate: (value) =>
                    checkForValidAccountId(value) || "Invalid address, please, enter a different one.",
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.nft?.treasuryWalletAccountId)}
            errorMessage={
              errors.governance?.nft?.treasuryWalletAccountId && errors.governance?.nft?.treasuryWalletAccountId.message
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
