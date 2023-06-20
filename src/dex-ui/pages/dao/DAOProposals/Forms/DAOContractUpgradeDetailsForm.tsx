import { FormInput, FormTextArea } from "@dex-ui-components";
import { CreateDAOContractUpgradeForm } from "../types";
import { useFormContext } from "react-hook-form";
import { isValidUrl } from "@utils";
import { Flex } from "@chakra-ui/react";

export function DAOContractUpgradeDetailsForm() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateDAOContractUpgradeForm>();
  return (
    <Flex direction="column" gap="1.3rem">
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
      <FormInput<"newProxyAddress">
        inputProps={{
          id: "newProxyAddress",
          label: "New implementation address",
          type: "text",
          placeholder: "Enter Implementation address",
          register: {
            ...register("newProxyAddress", {
              required: { value: true, message: "New implementation address is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.newProxyAddress)}
        errorMessage={errors?.newProxyAddress && errors?.newProxyAddress?.message}
      />
      <FormInput<"oldProxyAddress">
        inputProps={{
          id: "oldProxyAddress",
          label: "Proxy address",
          type: "text",
          placeholder: "Enter proxy address",
          register: {
            ...register("oldProxyAddress", {
              required: { value: true, message: "Proxy address is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.oldProxyAddress)}
        errorMessage={errors?.oldProxyAddress && errors?.oldProxyAddress?.message}
      />
    </Flex>
  );
}
