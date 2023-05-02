import { Notification, FormInput, NotficationTypes, useNotification, LoadingDialog, Color } from "@dex-ui-components";
import { CreateANFTDAOForm } from "../types";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "./DAOFormContainer";
import { useCreateNonFungibleToken, useFetchAccountInfo } from "@hooks";
import { Button, Center, Divider, Flex, Text } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { useEffect } from "react";

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
  const createNFT = useCreateNonFungibleToken(handleCreateTokenSuccessful);
  const accountInfo = useFetchAccountInfo();
  const supplyKey = accountInfo.data?.key.key ?? "";
  const { data: tokenData } = createNFT;

  const isLoadingDialogOpen = createNFT.isLoading || accountInfo.isLoading;
  const isErrorDialogOpen = createNFT.isError || accountInfo.isError;

  function getLoadingDialogMessage(): string {
    if (createNFT.isLoading)
      return `Please confirm the create ${governance.nft.name} 
    NFT transaction in your wallet to proceed.`;
    if (accountInfo.isLoading) return "Please wait while we get your account public key";
    return "";
  }

  function getErrorDialogMessage(): string {
    if (accountInfo.isError) return accountInfo.error?.message;
    if (createNFT.isError) return createNFT.error?.message;
    return "";
  }

  const loadingDialogMessage = getLoadingDialogMessage();
  const errorDialogMessage = getErrorDialogMessage();

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
      successPayload: tokenData ?? null,
      errorMessage: createNFT.error?.message ?? "",
    },
  });

  useEffect(() => {
    if (supplyKey) {
      setValue("governance.nft.supplyKey", supplyKey, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supplyKey]);

  function handleCreateTokenSuccessful() {
    setIsNotificationVisible(true);
  }

  function handleGetAccountInfoClick() {
    accountInfo.mutate(undefined);
  }

  async function createNewToken() {
    const isCreateTokenDataValid = await trigger([
      "governance.nft.name",
      "governance.nft.symbol",
      "governance.nft.maxSupply",
      "governance.nft.supplyKey",
      "governance.nft.treasuryWalletAccountId",
    ]);
    if (isCreateTokenDataValid) {
      const nftDAOFormData = formValues as CreateANFTDAOForm;
      const {
        governance: {
          nft: { name, symbol, maxSupply, supplyKey, treasuryWalletAccountId },
        },
      } = nftDAOFormData;
      createNFT.mutate({
        name,
        symbol,
        maxSupply,
        supplyKey,
        treasuryAccountId: treasuryWalletAccountId,
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
              }),
            },
          }}
          isInvalid={Boolean(errors.governance?.nft?.maxSupply)}
          errorMessage={errors.governance?.nft?.maxSupply && errors.governance?.nft?.maxSupply?.message}
        />
        <Flex direction="row" gap="4" alignItems="flex-end">
          <FormInput<"governance.nft.supplyKey">
            flex="5"
            inputProps={{
              flex: 5,
              id: "governance.nft.supplyKey",
              label: "Supply Key",
              type: "text",
              isReadOnly: true,
              value: supplyKey,
              placeholder: "Enter Supply Key",
              register: {
                ...register("governance.nft.supplyKey", {
                  required: { value: true, message: "Supply key is required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.nft?.supplyKey)}
            errorMessage={errors.governance?.nft?.supplyKey && errors.governance?.nft?.supplyKey?.message}
          />
          <Button key="get-nft-supply-key" onClick={handleGetAccountInfoClick} flex="1" marginBottom="8px">
            Get Supply Key
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
              }),
            },
          }}
          isInvalid={Boolean(errors.governance?.nft?.treasuryWalletAccountId)}
          errorMessage={
            errors.governance?.nft?.treasuryWalletAccountId && errors.governance?.nft?.treasuryWalletAccountId.message
          }
        />
      </DAOFormContainer>
      <Flex gap="4" alignItems="center">
        <Notification
          type={NotficationTypes.WARNING}
          textStyle="b3"
          message={`If you create a new NFT you will need to manually enter 
                    the id of that NFT in this form. NFT details can be found using the 
                    hashscan link provided after a successful NFT creation.`}
        />
        <Button key="create-nft" onClick={createNewToken}>
          Create New NFT
        </Button>
      </Flex>
      <LoadingDialog isOpen={isLoadingDialogOpen} message={loadingDialogMessage} />
      <LoadingDialog
        isOpen={isErrorDialogOpen}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        message={errorDialogMessage}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            accountInfo.reset();
            createNFT.reset();
          },
        }}
      />
    </>
  );
}
