import { Flex } from "@chakra-ui/react";
import { Text, HashScanLink, HashscanData, FormInput, FormTextArea, FormDropdown } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { CreateDAOProposalContext, CreateDAOTokenAssociateForm, DAOProposalType } from "../types";
import { isNil } from "ramda";
import { ChangeEvent, useEffect } from "react";
import { isValidUrl } from "@dex/utils";
import { useTokenNFTs } from "@dex/hooks";
import { Routes } from "@dao/routes";

export function DAOTokenAssociateDetailsForm() {
  const { safeAccountId, assets, proposalType, daoType, governanceTokenId } =
    useOutletContext<CreateDAOProposalContext>();
  const {
    setValue,
    register,
    formState: { errors },
  } = useFormContext<CreateDAOTokenAssociateForm>();
  const { data: tokenNFTs = [] } = useTokenNFTs(governanceTokenId);

  useEffect(() => {
    if (proposalType !== DAOProposalType.TokenAssociate) {
      setValue("type", DAOProposalType.TokenAssociate);
    }
  }, [setValue, proposalType]);

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
      <Flex direction="column" alignItems="left" gap="1">
        <Text.P_Small_Medium>Associating To</Text.P_Small_Medium>
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
    </Flex>
  );
}
