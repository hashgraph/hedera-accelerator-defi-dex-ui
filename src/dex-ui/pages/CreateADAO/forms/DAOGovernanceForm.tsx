import { Text, Flex, Divider, Center, Button } from "@chakra-ui/react";
import { FieldErrorsImpl, UseFormRegister } from "react-hook-form";
import { CreateADAOData } from "../CreateADAOPage";
import { DAOFormContainer } from "./DAOFormContainer";
import { Notification, FormInput, NotficationTypes } from "../../../../dex-ui-components";

interface DAOGovernanceFormProps {
  notification: any;
  register: UseFormRegister<CreateADAOData>;
  errors: Partial<FieldErrorsImpl<CreateADAOData>>;
  createNewToken: () => void;
}

export function DAOGovernanceForm(props: DAOGovernanceFormProps) {
  return (
    <Flex direction="column" alignItems="left" gap="4">
      {props.notification.isSuccessNotificationVisible && (
        <Notification
          type={NotficationTypes.SUCCESS}
          textStyle="b3"
          message={props.notification.successNotificationMessage}
          isLinkShown={true}
          linkText="View in HashScan"
          linkRef={props.notification.hashscanTransactionLink}
          isCloseButtonShown={true}
          handleClickClose={props.notification.handleCloseNotificationButtonClicked}
        />
      )}
      <DAOFormContainer>
        <FormInput<"token.id">
          inputProps={{
            id: "token.id",
            label: "Token ID",
            type: "text",
            placeholder: "Enter token id",
            register: {
              ...props.register("token.id", { required: { value: true, message: "A token id is required." } }),
            },
          }}
          isInvalid={Boolean(props.errors.token?.id)}
          errorMessage={props.errors.token?.id && props.errors.token?.id.message}
        />
      </DAOFormContainer>
      <DAOFormContainer>
        <Flex direction="row" gap="4">
          <FormInput<"token.name">
            flex="3"
            inputProps={{
              id: "token.name",
              label: "Name",
              type: "text",
              placeholder: "Enter token name",
              register: {
                ...props.register("token.name", {
                  required: { value: true, message: "A token name is required." },
                }),
              },
            }}
            isInvalid={Boolean(props.errors.token?.name)}
            errorMessage={props.errors.token?.name && props.errors.token?.name.message}
          />
          <Center height="64px">
            <Divider orientation="vertical" />
          </Center>
          <FormInput<"token.symbol">
            flex="2"
            inputProps={{
              flex: 2,
              id: "token.symbol",
              label: "Symbol",
              type: "text",
              placeholder: "Enter Symbol",
              register: {
                ...props.register("token.symbol", {
                  required: { value: true, message: "A token symbol is required." },
                }),
              },
            }}
            isInvalid={Boolean(props.errors.token?.symbol)}
            errorMessage={props.errors.token?.symbol && props.errors.token?.symbol.message}
          />
          <Center height="64px">
            <Divider orientation="vertical" />
          </Center>
          <FormInput<"token.decimals">
            flex="1"
            inputProps={{
              flex: 1,
              id: "token.decimals",
              label: "Decimals",
              type: "number",
              placeholder: "",
              register: {
                ...props.register("token.decimals", {
                  required: { value: true, message: "Decimals are required." },
                }),
              },
            }}
            isInvalid={Boolean(props.errors.token?.decimals)}
            errorMessage={props.errors.token?.decimals && props.errors.token?.decimals.message}
          />
        </Flex>
        <FormInput<"token.logo">
          inputProps={{
            id: "token.logo",
            label: "Logo",
            type: "text",
            placeholder: "Enter image URL",
            register: {
              ...props.register("token.logo", {
                required: { value: true, message: "A token logo is required." },
              }),
            },
          }}
          isInvalid={Boolean(props.errors.token?.logo)}
          errorMessage={props.errors.token?.logo && props.errors.token?.logo.message}
        />
        <FormInput<"token.initialSupply">
          inputProps={{
            id: "token.initialSupply",
            label: "Initial token supply",
            type: "number",
            placeholder: "Enter amount",
            unit: "$TOKEN",
            register: {
              ...props.register("token.initialSupply", {
                required: { value: true, message: "An initial token supply is required." },
              }),
            },
          }}
          formHelperText="If not specified, can be unlimited"
          isInvalid={Boolean(props.errors.token?.initialSupply)}
          errorMessage={props.errors.token?.initialSupply && props.errors.token?.initialSupply.message}
        />
      </DAOFormContainer>
      <Text textStyle="p large regular">Initial token distribution</Text>
      <DAOFormContainer>
        <FormInput<"token.treasuryWalletAccountId">
          inputProps={{
            id: "token.treasuryWalletAccountId",
            label: "Treasury wallet account id",
            type: "text",
            placeholder: "Enter wallet account id",
            register: {
              ...props.register("token.treasuryWalletAccountId", {
                required: { value: true, message: "A treasury account id is required." },
              }),
            },
          }}
          isInvalid={Boolean(props.errors.token?.treasuryWalletAccountId)}
          errorMessage={
            props.errors.token?.treasuryWalletAccountId && props.errors.token?.treasuryWalletAccountId.message
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
        <Button key="create-token" onClick={props.createNewToken}>
          Create Token
        </Button>
      </Flex>
    </Flex>
  );
}
