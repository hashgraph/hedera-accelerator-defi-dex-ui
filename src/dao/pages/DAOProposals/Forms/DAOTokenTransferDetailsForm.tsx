import { Flex, Tabs, TabList, Tab } from "@chakra-ui/react";
import {
  Text,
  FormTokenInput,
  HashScanLink,
  HashscanData,
  FormInput,
  FormTextArea,
  FormDropdown,
  InlineAlert,
  InlineAlertType,
  Color,
} from "@shared/ui-kit";
import { useFormContext } from "react-hook-form";
import { useLocation, useOutletContext } from "react-router-dom";
import { CreateDAOTokenTransferForm, CreateDAOProposalContext, DAOProposalType } from "../types";
import { isValidUrl } from "@dex/utils";
import { ChangeEvent, useEffect } from "react";
import { useAccountTokenBalances, useTabFilters, useTokenNFTs } from "@dex/hooks";
import { Routes } from "@dao/routes";
import { TokenType } from "@hashgraph/sdk";
import { useGetBlockedTokenBalance } from "@dao/hooks";
import { DAOFormContainer } from "@dao/pages/CreateADAO/forms/DAOFormContainer";
import { DepositTokenModalTabs } from "@dao/pages/MultiSigDAODashboard/types";
import { isNFT } from "shared";

export interface TokenTransferLocationState {
  state: {
    tokenId: string;
    tokenType: string;
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
    watch,
    formState: { errors },
  } = form;
  const { data: governanceTokenNFTs = [] } = useTokenNFTs(governanceTokenId);
  const tokensQueryResults = useAccountTokenBalances(safeAccountId);
  const { data: tokens = [] } = tokensQueryResults;
  const { data: blockedNFTs } = useGetBlockedTokenBalance(safeAccountId, governanceTokenId);
  const { tabIndex, handleTabChange } = useTabFilters(isNFT(state?.tokenType) ? 1 : 0);

  const changeTab = (tabIndex: number) => {
    handleTabChange(tabIndex);
    setValue(
      "tokenType",
      tabIndex === 0 ? TokenType.FungibleCommon.toString() : TokenType.NonFungibleUnique.toString()
    );
    setValue("tokenId", "");
  };

  if (proposalType !== DAOProposalType.TokenTransfer) {
    setValue("type", DAOProposalType.TokenTransfer);
  }

  useEffect(() => {
    if (state?.tokenId) {
      setValue("tokenId", state.tokenId);
    }
    if (state?.tokenType) {
      setValue("tokenType", state.tokenType);
    }
  }, [setValue, state?.tokenId, state?.tokenType]);

  const { amount = "", tokenId = "" } = getValues();
  const { data: tokenNFTs = [], isLoading } = useTokenNFTs(tokenId, safeAccountId);
  const nftTokenWithGovernor =
    getValues().tokenId === governanceTokenId
      ? tokenNFTs?.filter((nft) => !(blockedNFTs as number[])?.find((block) => Number(block) === nft.serial_number))
      : tokenNFTs;

  watch(["tokenId", "tokenType"]);

  return (
    <Flex direction="column" gap="4" width="100%">
      <Flex>
        {tokens.filter((token) => token.isNFT).length > 0 && (
          <Tabs isFitted onChange={changeTab} index={tabIndex} variant="dao-create-new" width="100%">
            <DAOFormContainer rest={{ padding: "0.1rem" }}>
              <TabList>
                <Tab>Token</Tab>
                <Tab>NFT</Tab>
              </TabList>
            </DAOFormContainer>
          </Tabs>
        )}
      </Flex>
      <Flex
        border={`1px solid ${Color.Neutral._200}`}
        padding="1.5rem"
        borderRadius="0.25rem"
        flexDirection="column"
        gap="4"
      >
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
          <Text.P_Small_Medium>Sending from</Text.P_Small_Medium>
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
        {tabIndex === DepositTokenModalTabs.Fungible && (
          <FormTokenInput
            amountFormId="amount"
            tokenFormId="tokenId"
            assetListAccountId={safeAccountId}
            balanceAccountId={safeAccountId}
            initialSelectedTokenId={tokenId}
            currentAmount={amount}
            isInvalid={Boolean(errors?.amount)}
            errorMessage={errors?.amount && errors?.amount?.message}
            form={form}
          />
        )}
        {tabIndex === DepositTokenModalTabs.NFT && (
          <Flex direction="column" gap={4}>
            <FormDropdown
              label="NFT To Transfer"
              placeholder="Select a NFT"
              data={tokens
                .filter((token) => token.isNFT)
                .map((input) => {
                  return {
                    label: input.name,
                    value: input.tokenId,
                  };
                })}
              isInvalid={Boolean(errors?.tokenId)}
              errorMessage={errors.tokenId && errors.tokenId.message}
              register={register("tokenId", {
                required: { value: true, message: "A token is required" },
                onChange: (e: ChangeEvent<HTMLSelectElement>) => {
                  setValue("tokenId", e.target.value);
                  setValue("nftSerialId", 0);
                },
              })}
            />
            <FormDropdown
              label="NFT Serial Number To Transfer"
              placeholder="Select a serial number"
              data={nftTokenWithGovernor.map((input: any) => {
                return {
                  label: input.serial_number,
                  value: input.serial_number,
                };
              })}
              isInvalid={Boolean(errors?.nftSerialId)}
              errorMessage={errors?.nftSerialId?.message}
              register={register("nftSerialId", {
                required: { value: true, message: "Please select a NFT serial id to be transferred." },
                onChange: (e: ChangeEvent<HTMLSelectElement>) => setValue("nftSerialId", Number(e.target.value)),
              })}
            />
            {tokenId && !isLoading && tokenNFTs.length === 0 && (
              <InlineAlert type={InlineAlertType.Warning} message={`No deposits found in assets for selected Token.`} />
            )}
          </Flex>
        )}
        {daoType === Routes.NFT && (
          <>
            <FormDropdown
              label="Governance Token Serial Number"
              placeholder="Select a governance token serial number"
              data={governanceTokenNFTs.map((input: any) => {
                return {
                  label: input.serial_number,
                  value: input.serial_number,
                };
              })}
              isInvalid={Boolean(errors?.governanceNftTokenSerialId)}
              errorMessage={errors.governanceNftTokenSerialId && errors.governanceNftTokenSerialId.message}
              register={register("governanceNftTokenSerialId", {
                required: {
                  value: true,
                  message: "A governance token serial id is required to be locked to create proposal.",
                },
                onChange: (e: ChangeEvent<HTMLSelectElement>) =>
                  setValue("governanceNftTokenSerialId", Number(e.target.value)),
              })}
            />
          </>
        )}
      </Flex>
    </Flex>
  );
}
