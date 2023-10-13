import { FormInput, FormTextArea, FormDropdown } from "@shared/ui-kit";
import { CreateDAOContractUpgradeForm, CreateDAOProposalContext } from "../types";
import { useFormContext } from "react-hook-form";
import { isValidUrl } from "@dex/utils";
import { Flex } from "@chakra-ui/react";
import { useOutletContext } from "react-router-dom";
import { useTokenNFTs } from "@dex/hooks";
import { Routes } from "@dao/routes";
import { ChangeEvent } from "react";

export function DAOContractUpgradeDetailsForm() {
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<CreateDAOContractUpgradeForm>();
  const { governanceTokenId, daoType } = useOutletContext<CreateDAOProposalContext>();
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
      <FormInput<"newImplementationAddress">
        inputProps={{
          id: "newProxyAddress",
          label: "New implementation address",
          type: "text",
          placeholder: "Enter Implementation address",
          register: {
            ...register("newImplementationAddress", {
              required: { value: true, message: "New implementation address is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.newImplementationAddress)}
        errorMessage={errors?.newImplementationAddress && errors?.newImplementationAddress?.message}
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
      <FormInput<"proxyAdmin">
        inputProps={{
          id: "proxyAdmin",
          label: "Proxy admin",
          type: "text",
          placeholder: "Enter proxy admin id",
          register: {
            ...register("proxyAdmin", {
              required: { value: true, message: "Proxy admin id is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors?.proxyAdmin)}
        errorMessage={errors?.proxyAdmin && errors?.proxyAdmin?.message}
      />
      {daoType === Routes.NFT && (
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
      )}
    </Flex>
  );
}
