import { Text, Flex } from "@chakra-ui/react";
import {
  HashScanLink,
  HashscanData,
  FormInput,
  FormTextArea,
  FormDropdown,
  FormTokenInput,
  useHalfMaxButtons,
  useFormTokenInputPattern,
} from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { useLocation, useOutletContext } from "react-router-dom";
import { CreateDAOTokenTransferForm, CreateDAOProposalContext, DAOProposalType } from "../types";
import { isValidUrl } from "@utils";
import { ChangeEvent, useEffect } from "react";
import { TokenBalance, useAccountTokenBalances } from "@hooks";
import { HBARTokenId, HBARSymbol } from "@services";
import { isEmpty, isNil } from "ramda";
import BigNumber from "bignumber.js";

export interface TokenTransferLocationState {
  state: {
    tokenId: string;
  };
}

export function DAOTokenTransferDetailsForm() {
  const { state } = useLocation() as TokenTransferLocationState;
  const { safeAccountId, daoType, proposalType } = useOutletContext<CreateDAOProposalContext>();
  const {
    getValues,
    setValue,
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreateDAOTokenTransferForm>();
  watch("tokenId");
  const accountTokenBalancesQueryResults = useAccountTokenBalances(safeAccountId ?? "");
  const { data: tokenBalances } = accountTokenBalancesQueryResults;
  const { tokenId } = getValues();
  const selectedAsset =
    isEmpty(tokenId) || isNil(tokenId)
      ? undefined
      : tokenBalances?.find(
          (asset: TokenBalance) => asset.tokenId === tokenId || (tokenId === HBARTokenId && asset.symbol === HBARSymbol)
        );

  const { handleMaxButtonClicked, handleHalfButtonClicked } = useHalfMaxButtons(
    String(selectedAsset?.balance ?? 0),
    (amount: string | undefined) => setValue("amount", amount)
  );

  const { handleTokenInputChangeWithPattern } = useFormTokenInputPattern((value: string) => setValue("amount", value));

  if (proposalType !== DAOProposalType.TokenTransfer) {
    setValue("type", DAOProposalType.TokenTransfer);
  }

  useEffect(() => {
    if (state?.tokenId) {
      setValue("tokenId", state?.tokenId);
    }
  }, [setValue, state?.tokenId]);

  function validateAmount(value: string | undefined) {
    if (!value) {
      return "An amount is required.";
    }
    const valueAsBigNumber = BigNumber(value);
    if (!selectedAsset?.balance || selectedAsset?.balance <= 0) {
      return "Token balance must be greater than 0.";
    }
    if (valueAsBigNumber.gt(selectedAsset?.balance)) {
      return "Amount must be less than or equal to token balance.";
    }
    if (valueAsBigNumber.lte(0)) {
      return "Amount must be greater than 0.";
    }
    if (!tokenId) {
      return "A token must be selected.";
    }
    return true;
  }

  const assetDropdownOptions =
    tokenBalances?.map((asset: TokenBalance) => {
      const { symbol, tokenId } = asset;
      if (symbol === HBARSymbol) {
        return {
          label: symbol,
          value: HBARTokenId,
        };
      }
      return {
        label: symbol,
        value: tokenId,
      };
    }) ?? [];

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
      {daoType === "multisig" ? (
        <FormDropdown
          label="Assets"
          placeholder="Select an asset"
          data={assetDropdownOptions}
          isInvalid={Boolean(errors?.tokenId)}
          errorMessage={errors?.tokenId && errors?.tokenId?.message}
          register={register("tokenId", {
            required: { value: true, message: "A token is required." },
            onChange: (e: ChangeEvent<HTMLSelectElement>) => setValue("tokenId", e.target.value),
          })}
        />
      ) : (
        <FormInput<"tokenId">
          inputProps={{
            id: "tokenId",
            label: "Asset",
            type: "text",
            placeholder: "Enter a token ID",
            register: {
              ...register("tokenId", {
                required: { value: true, message: "A token ID is required." },
              }),
            },
            value: state?.tokenId,
          }}
          isInvalid={Boolean(errors?.tokenId)}
          errorMessage={errors?.tokenId && errors?.tokenId?.message}
        />
      )}
      <FormTokenInput<"amount">
        inputProps={{
          id: "amount",
          pointerEvents: "all",
          type: "text",
          placeholder: "Enter amount",
          label: (
            <FormTokenInput.Label
              tokenSymbol={selectedAsset?.symbol ?? ""}
              balance={selectedAsset ? String(selectedAsset.balance ?? 0) : "--"}
            />
          ),
          unit: (
            <FormTokenInput.RightUnitContent
              tokenSymbol={selectedAsset?.symbol}
              handleHalfButtonClicked={handleHalfButtonClicked}
              handleMaxButtonClicked={handleMaxButtonClicked}
            />
          ),
          register: {
            ...register("amount", {
              required: { value: true, message: "An amount is required." },
              validate: { validateAmount },
              onChange: handleTokenInputChangeWithPattern,
            }),
          },
        }}
        isInvalid={Boolean(errors?.amount)}
        errorMessage={errors?.amount && errors?.amount?.message}
      />
    </Flex>
  );
}
