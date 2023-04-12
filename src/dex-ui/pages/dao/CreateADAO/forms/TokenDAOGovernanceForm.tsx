import { Text, Flex, Divider, Center, Button } from "@chakra-ui/react";
import { useFormContext } from "react-hook-form";
import { CreateATokenDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import {
  Notification,
  FormInput,
  NotficationTypes,
  useNotification,
  LoadingDialog,
  Color,
} from "../../../../../dex-ui-components";
import { useCreateToken } from "../../../../hooks";
import { WarningIcon } from "@chakra-ui/icons";

export function TokenDAOGovernanceForm() {
  const {
    getValues,
    register,
    trigger,
    formState: { errors },
  } = useFormContext<CreateATokenDAOForm>();
  const formValues = getValues();
  const { governance } = formValues;
  const createToken = useCreateToken(handleCreateTokenSuccessful);
  const { data: tokenData, error, isLoading, isError, reset } = createToken;

  const {
    setIsNotificationVisible,
    isSuccessNotificationVisible,
    successNotificationMessage,
    hashscanTransactionLink,
    handleCloseNotificationButtonClicked,
  } = useNotification({
    successMessage: `${governance?.token?.symbol} token was successfully created`,
    transactionState: {
      transactionWaitingToBeSigned: false,
      successPayload: tokenData ?? null,
      errorMessage: error?.message ?? "",
    },
  });

  function handleCreateTokenSuccessful() {
    setIsNotificationVisible(true);
  }

  async function createNewToken() {
    const isCreateTokenDataValid = await trigger([
      "governance.token.name",
      "governance.token.symbol",
      "governance.token.decimals",
      "governance.token.initialSupply",
      "governance.token.treasuryWalletAccountId",
    ]);
    if (isCreateTokenDataValid) {
      const tokenDAOFormData = formValues as CreateATokenDAOForm;
      const {
        governance: {
          token: { name, symbol, initialSupply, decimals, treasuryWalletAccountId },
        },
      } = tokenDAOFormData;
      createToken.mutate({
        name,
        symbol,
        initialSupply,
        decimals,
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
        <FormInput<"governance.token.id">
          inputProps={{
            id: "governance.token.id",
            label: "Token ID",
            type: "text",
            placeholder: "Enter token id",
            register: {
              ...register("governance.token.id", {
                required: { value: true, message: "A token id is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.governance?.token?.id)}
          errorMessage={errors.governance?.token?.id && errors.governance?.token?.id.message}
        />
      </DAOFormContainer>
      <DAOFormContainer>
        <Flex direction="row" gap="4">
          <FormInput<"governance.token.name">
            flex="3"
            inputProps={{
              id: "governance.token.name",
              label: "Name",
              type: "text",
              placeholder: "Enter token name",
              register: {
                ...register("governance.token.name", {
                  required: { value: true, message: "A token name is required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.token?.name)}
            errorMessage={errors.governance?.token?.name && errors.governance?.token?.name.message}
          />
          <Center height="64px">
            <Divider orientation="vertical" />
          </Center>
          <FormInput<"governance.token.symbol">
            flex="2"
            inputProps={{
              flex: 2,
              id: "governance.token.symbol",
              label: "Symbol",
              type: "text",
              placeholder: "Enter Symbol",
              register: {
                ...register("governance.token.symbol", {
                  required: { value: true, message: "A token symbol is required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.token?.symbol)}
            errorMessage={errors.governance?.token?.symbol && errors.governance?.token?.symbol.message}
          />
          <Center height="64px">
            <Divider orientation="vertical" />
          </Center>
          <FormInput<"governance.token.decimals">
            flex="1"
            inputProps={{
              flex: 1,
              id: "governance.token.decimals",
              label: "Decimals",
              type: "number",
              placeholder: "",
              register: {
                ...register("governance.token.decimals", {
                  required: { value: true, message: "Decimals are required." },
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.token?.decimals)}
            errorMessage={errors.governance?.token?.decimals && errors.governance?.token?.decimals.message}
          />
        </Flex>
        <FormInput<"governance.token.logo">
          inputProps={{
            id: "governance.token.logo",
            label: "Logo",
            type: "text",
            placeholder: "Enter image URL",
            register: {
              ...register("governance.token.logo", {
                required: { value: true, message: "A token logo is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.governance?.token?.logo)}
          errorMessage={errors.governance?.token?.logo && errors.governance?.token?.logo.message}
        />
        <FormInput<"governance.token.initialSupply">
          inputProps={{
            id: "governance.token.initialSupply",
            label: "Initial token supply",
            type: "number",
            placeholder: "Enter amount",
            unit: "$TOKEN",
            register: {
              ...register("governance.token.initialSupply", {
                required: { value: true, message: "An initial token supply is required." },
              }),
            },
          }}
          formHelperText="If not specified, can be unlimited"
          isInvalid={Boolean(errors.governance?.token?.initialSupply)}
          errorMessage={errors.governance?.token?.initialSupply && errors.governance?.token?.initialSupply.message}
        />
      </DAOFormContainer>
      <Text textStyle="p large regular">Initial token distribution</Text>
      <DAOFormContainer>
        <FormInput<"governance.token.treasuryWalletAccountId">
          inputProps={{
            id: "governance.token.treasuryWalletAccountId",
            label: "Treasury wallet account id",
            type: "text",
            placeholder: "Enter wallet account id",
            register: {
              ...register("governance.token.treasuryWalletAccountId", {
                required: { value: true, message: "A treasury account id is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.governance?.token?.treasuryWalletAccountId)}
          errorMessage={
            errors.governance?.token?.treasuryWalletAccountId &&
            errors.governance?.token?.treasuryWalletAccountId.message
          }
        />
      </DAOFormContainer>
      <Flex gap="4" alignItems="center">
        <Notification
          type={NotficationTypes.WARNING}
          textStyle="b3"
          message={`If you create a new token you will need to manually enter 
        the id of that token in this form. Token details can be found using the 
        hashscan link provided after a successful token creation.`}
        />
        <Button key="create-token" onClick={createNewToken}>
          Create Token
        </Button>
      </Flex>
      <LoadingDialog
        isOpen={isLoading}
        message={`Please confirm the create ${governance.token.name} 
        token transaction in your wallet to proceed.`}
      />
      <LoadingDialog
        isOpen={isError}
        message={error?.message ?? ""}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            reset();
          },
        }}
      />
    </>
  );
}
