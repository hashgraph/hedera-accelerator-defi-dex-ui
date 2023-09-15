import { Text, Color, FormDropdown, FormInput, FormTextArea, ProgressBar } from "@shared/ui-kit";
import { CreateDAOProposalContext, CreateDAOTextProposalForm } from "../types";
import { useFormContext } from "react-hook-form";
import { isValidUrl } from "@dex/utils";
import { Flex } from "@chakra-ui/react";
import { useTokenNFTs } from "@dex/hooks";
import { useOutletContext } from "react-router-dom";
import { ChangeEvent, useState } from "react";
import { Routes } from "@dao/routes";
import HIPTemplate from "../HIPTemplate.md?raw";
import { getByteSize } from "@shared/utils";

const Bytes_In_A_KB = 1024;

export function DAOTextProposalDetailsForm() {
  const { governanceTokenId, daoType } = useOutletContext<CreateDAOProposalContext>();
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<CreateDAOTextProposalForm>();
  const { metadata } = getValues();
  const [markdownBytes, setMarkdownBytes] = useState(getByteSize(metadata));
  const { data: tokenNFTs = [] } = useTokenNFTs(governanceTokenId);
  const percentOfMaxMarkdownBytesUsed = Number(((markdownBytes / Bytes_In_A_KB) * 100).toFixed(1));
  const isMarkdownSizeUnderLimit = percentOfMaxMarkdownBytesUsed <= 100;

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
      {daoType !== Routes.Multisig && (
        <>
          <FormTextArea<"metadata">
            formHelperText={
              <Flex direction="column" gap="1">
                <Text.P_Small_Regular color={isMarkdownSizeUnderLimit ? "inherit" : Color.Destructive._500}>
                  {`Custom description ${
                    isMarkdownSizeUnderLimit ? "size limit used" : "exceeds maximum size"
                  }: ${percentOfMaxMarkdownBytesUsed}/100%`}
                </Text.P_Small_Regular>
                <ProgressBar
                  progressBarColor={isMarkdownSizeUnderLimit ? Color.Grey_Blue._300 : Color.Destructive._300}
                  value={percentOfMaxMarkdownBytesUsed}
                  height="4px"
                  width="100%"
                />
              </Flex>
            }
            textAreaProps={{
              id: "metadata",
              label: "Custom Description",
              minHeight: "480px",
              placeholder: HIPTemplate,
              register: {
                ...register("metadata", {
                  /* TODO: Add markdown syntax validations. */
                  validate: () => isMarkdownSizeUnderLimit || "",
                  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => setMarkdownBytes(getByteSize(e.target.value)),
                }),
              },
            }}
            isInvalid={Boolean(errors?.metadata)}
            errorMessage={errors?.metadata && errors?.metadata?.message}
          />
        </>
      )}
    </Flex>
  );
}
