import { Flex } from "@chakra-ui/react";
import { FormInput, FormTextArea } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { CreateDAOMemberOperationForm, CreateDAOProposalContext, DAOProposalType } from "../types";
import { checkForValidAccountId } from "@dex/utils";
import { useLocation, useOutletContext } from "react-router-dom";

export interface ReplaceMemberLocationState {
  state: {
    memberId: string;
  };
}

export function DAOReplaceMemberDetailsForm() {
  const { state } = useLocation() as ReplaceMemberLocationState;
  const { proposalType } = useOutletContext<CreateDAOProposalContext>();
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext<CreateDAOMemberOperationForm>();

  if (proposalType !== DAOProposalType.ReplaceMember) {
    setValue("type", DAOProposalType.ReplaceMember);
  }

  return (
    <Flex direction="column" gap="1.3rem">
      <FormInput<"title">
        inputProps={{
          id: "title",
          label: "Title",
          type: "text",
          placeholder: "Enter Title",
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
      <FormInput<"memberAddress">
        inputProps={{
          id: "memberAddress",
          label: "Member to be replaced",
          type: "text",
          placeholder: "Enter Member Address",
          register: {
            ...register("memberAddress", {
              required: { value: true, message: "A member address is required." },
              validate: (value) => checkForValidAccountId(value) || "Invalid address, please, enter a different one.",
            }),
          },
          value: state?.memberId,
        }}
        isInvalid={Boolean(errors?.memberAddress)}
        errorMessage={errors?.memberAddress && errors?.memberAddress.message}
      />
      <FormInput<"newMemberAddress">
        inputProps={{
          id: "newMemberAddress",
          label: "New Member",
          type: "text",
          placeholder: "Enter New Member Address",
          register: {
            ...register("newMemberAddress", {
              required: { value: true, message: "A member address is required." },
              validate: (value) => checkForValidAccountId(value) || "Invalid address, please, enter a different one.",
            }),
          },
        }}
        isInvalid={Boolean(errors?.newMemberAddress)}
        errorMessage={errors?.newMemberAddress && errors?.newMemberAddress?.message}
      />
    </Flex>
  );
}
