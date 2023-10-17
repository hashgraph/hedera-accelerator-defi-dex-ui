import { FormDropdown, FormInput, FormTextArea } from "@shared/ui-kit";
import { CreateDAOProposalContext, CreateDAOTextProposalForm } from "../types";
import { useFormContext } from "react-hook-form";
import { isValidUrl } from "@dex/utils";
import { Flex } from "@chakra-ui/react";
import { useTokenNFTs } from "@dex/hooks";
import { useOutletContext } from "react-router-dom";
import { ChangeEvent } from "react";
import { Routes } from "@dao/routes";
import HIPTemplate from "../HIPTemplate.md?raw";

export function DAOTextProposalDetailsForm() {
  const { governanceTokenId, daoType } = useOutletContext<CreateDAOProposalContext>();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateDAOTextProposalForm>();
  const { data: tokenNFTs = [] } = useTokenNFTs(governanceTokenId);

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
      {daoType === Routes.NFT && (
        <>
          <FormDropdown
            label="Token Serial Number"
            placeholder="Select a token serial number"
            data={tokenNFTs.map((input: any) => {
              return {
                label: input.serial_number,
                value: input.serial_number,
              };
            })}
            isInvalid={Boolean(errors?.nftTokenSerialId)}
            errorMessage={errors.nftTokenSerialId && errors.nftTokenSerialId.message}
            register={register("nftTokenSerialId", {
              required: { value: true, message: "A token is required to be locked to create proposal" },
              onChange: (e: ChangeEvent<HTMLSelectElement>) => setValue("nftTokenSerialId", Number(e.target.value)),
            })}
          />
        </>
      )}
      <FormTextArea<"metadata">
        textAreaProps={{
          id: "metadata",
          label: "Custom Description",
          minHeight: "480px",
          placeholder: HIPTemplate,
          register: {
            ...register("metadata"),
          },
        }}
        isInvalid={Boolean(errors?.metadata)}
        errorMessage={errors?.metadata && errors?.metadata?.message}
      />
    </Flex>
  );
}
