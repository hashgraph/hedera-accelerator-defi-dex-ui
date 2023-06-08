import { Text, Flex } from "@chakra-ui/react";
import { HashScanLink, HashscanData, FormInput, FormTextArea } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { CreateDAOTokenTransferForm, CreateDAOProposalContext } from "../types";
import { isValidUrl } from "@utils";

export function DAOTokenTransferDetailsForm() {
  const { safeAccountId, daoType } = useOutletContext<CreateDAOProposalContext>();
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateDAOTokenTransferForm>();
  return (
    <Flex direction="column" gap="4" width="100%">
      <FormInput<"title">
        inputProps={{
          id: "title",
          label: "Title",
          type: "text",
          placeholder: "Enter title",
          register: {
            ...register("title", {
              required: { value: true, message: "A title is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.title)}
        errorMessage={errors?.title && errors?.title?.message}
      />
      <FormTextArea<"description">
        textAreaProps={{
          id: "description",
          label: "Description",
          placeholder: "Add a description",
          register: {
            ...register("description", {
              required: { value: true, message: "A description is required." },
              validate: (value) => value.length <= 240 || "Maximum character count for the description is 240.",
            }),
          },
        }}
        isInvalid={Boolean(errors?.description)}
        errorMessage={errors?.description && errors?.description?.message}
      />
      {daoType !== "multisig" ? (
        <FormInput<"linkToDiscussion">
          inputProps={{
            id: "linkToDiscussion",
            label: "Link to discussion",
            type: "text",
            placeholder: "Enter URL",
            register: {
              ...register("linkToDiscussion", {
                validate: (value) => isValidUrl(value) || "Invalid URL, Please try again.",
              }),
            },
          }}
          isInvalid={Boolean(errors?.linkToDiscussion)}
          errorMessage={errors?.linkToDiscussion && errors?.linkToDiscussion?.message}
        />
      ) : undefined}
      <Flex direction="column" alignItems="left" gap="1">
        <Text textStyle="p small medium">Sending from</Text>
        <HashScanLink id={safeAccountId} type={HashscanData.Account} />
      </Flex>
      <FormInput<"recipientAccountId">
        inputProps={{
          id: "recipientAccountId",
          label: "Recipient Account ID",
          type: "text",
          placeholder: "Enter recipient account ID",
          register: {
            ...register("recipientAccountId", {
              required: { value: true, message: "A recipient account ID is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.recipientAccountId)}
        errorMessage={errors?.recipientAccountId && errors?.recipientAccountId?.message}
      />
      <FormInput<"tokenId">
        inputProps={{
          id: "tokenId",
          label: "Asset",
          type: "text",
          placeholder: "Enter a token ID",
          register: {
            ...register("tokenId", {
              required: { value: true, message: "A token ID is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.tokenId)}
        errorMessage={errors?.tokenId && errors?.tokenId?.message}
      />
      <FormInput<"amount">
        inputProps={{
          id: "amount",
          label: "Amount",
          type: "number",
          placeholder: "Enter amount",
          register: {
            ...register("amount", {
              required: { value: true, message: "An amount is required." },
              validate: (value: number) => {
                return value > 0 ? true : "Amount must be greater than 0.";
              },
            }),
          },
        }}
        isInvalid={Boolean(errors?.amount)}
        errorMessage={errors?.amount && errors?.amount?.message}
      />
    </Flex>
  );
}
