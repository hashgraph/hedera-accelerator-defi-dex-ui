import { Flex } from "@chakra-ui/react";
import { FormInput, FormTextArea } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { ReplaceMemberForm, ReplaceMemberWizardContext } from "./types";
import { useOutletContext } from "react-router-dom";
import { checkForValidAccountId } from "@utils";

export function ReplaceMemberDetailsForm() {
  const { memberId } = useOutletContext<ReplaceMemberWizardContext>();
  const {
    register,
    formState: { errors },
  } = useFormContext<ReplaceMemberForm>();

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
      <FormInput<"oldMember">
        inputProps={{
          id: "oldMember",
          label: "Member To be replaced",
          isReadOnly: true,
          value: memberId,
          type: "text",
        }}
      />
      <FormInput<"memberAddress">
        inputProps={{
          id: "memberAddress",
          label: "New Member",
          type: "text",
          placeholder: "Enter Member Address",
          register: {
            ...register("memberAddress", {
              required: { value: true, message: "A member address is required." },
              validate: (value) => checkForValidAccountId(value) || "Invalid address, please, enter a different one.",
            }),
          },
        }}
        isInvalid={Boolean(errors.memberAddress)}
        errorMessage={errors.memberAddress && errors.memberAddress.message}
      />
    </Flex>
  );
}
