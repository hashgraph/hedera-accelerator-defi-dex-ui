import { Text, Flex } from "@chakra-ui/react";
import { HashScanLink, HashscanData, FormInput, FormTextArea } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { CreateDAOProposalContext, CreateDAOTokenAssociateForm } from "../types";
import { isNil } from "ramda";

export function DAOTokenAssociateDetailsForm() {
  const { safeAccountId, assets } = useOutletContext<CreateDAOProposalContext>();
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateDAOTokenAssociateForm>();

  const isTokenAlreadyAssociated = (tokenId: string) => isNil(assets.find((token) => token.tokenId === tokenId));

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
      <Flex direction="column" alignItems="left" gap="1">
        <Text textStyle="p small medium">Associating To</Text>
        <HashScanLink id={safeAccountId} type={HashscanData.Account} />
      </Flex>
      <FormInput<"tokenId">
        inputProps={{
          id: "tokenId",
          label: "Asset",
          type: "text",
          placeholder: "Enter a token ID to Associate",
          register: {
            ...register("tokenId", {
              required: { value: true, message: "A token ID is required." },
              validate: (value) => isTokenAlreadyAssociated(value) || "Token Already Associated.",
            }),
          },
        }}
        isInvalid={Boolean(errors?.tokenId)}
        errorMessage={errors?.tokenId && errors?.tokenId?.message}
      />
    </Flex>
  );
}
