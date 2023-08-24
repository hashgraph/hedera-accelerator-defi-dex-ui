import { Text, Flex } from "@chakra-ui/react";
import { FormTokenInput, HashScanLink, HashscanData, FormInput, FormTextArea, FormDropdown } from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { useLocation, useOutletContext } from "react-router-dom";
import { CreateDAOTokenTransferForm, CreateDAOProposalContext, DAOProposalType } from "../types";
import { isValidUrl } from "@dex/utils";
import { ChangeEvent, useEffect } from "react";
import { useTokenNFTs } from "@dex/hooks";
import { Routes } from "@dao/routes";

export interface TokenTransferLocationState {
  state: {
    tokenId: string;
  };
}

export function DAOTokenTransferDetailsForm() {
  const { state } = useLocation() as TokenTransferLocationState;
  const { safeAccountId, daoType, proposalType, governanceTokenId } = useOutletContext<CreateDAOProposalContext>();
  const form = useFormContext<CreateDAOTokenTransferForm>();
  const {
    setValue,
    getValues,
    register,
    formState: { errors },
  } = form;
  const { data: tokenNFTs = [] } = useTokenNFTs(governanceTokenId);

  if (proposalType !== DAOProposalType.TokenTransfer) {
    setValue("type", DAOProposalType.TokenTransfer);
  }

  useEffect(() => {
    if (state?.tokenId) {
      setValue("tokenId", state?.tokenId);
    }
  }, [setValue, state?.tokenId]);

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
      <FormTokenInput
        amountFormId="amount"
        tokenFormId="tokenId"
        assetListAccountId={safeAccountId}
        balanceAccountId={safeAccountId}
        initialSelectedTokenId={state?.tokenId}
        currentAmount={getValues().amount ?? ""}
        isInvalid={Boolean(errors?.amount)}
        errorMessage={errors?.amount && errors?.amount?.message}
        form={form}
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
