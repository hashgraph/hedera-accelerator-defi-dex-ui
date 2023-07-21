import { Text, Flex, Button } from "@chakra-ui/react";
import { HashScanLink, HashscanData, FormInput, FormTextArea } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { useLocation, useOutletContext } from "react-router-dom";
import { CreateDAOTokenTransferForm, CreateDAOProposalContext, DAOProposalType } from "../types";
import { isValidUrl } from "@utils";
import { useEffect } from "react";
import { DexService } from "@dex-ui/services";
import { useDexContext } from "@hooks";

export interface TokenTransferLocationState {
  state: {
    tokenId: string;
  };
}

export function DAOTokenTransferDetailsForm() {
  /*
   * TODO: Replace Assets Input with Dropdown
   * const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
   * const accountTokenBalancesQueryResults = useAccountTokenBalances(wallet.savedPairingData?.accountIds[0] ?? "");
   * const { data: tokenBalances } = accountTokenBalancesQueryResults;
   */
  const { state } = useLocation() as TokenTransferLocationState;
  const { safeAccountId, daoType, proposalType, daoAccountId } = useOutletContext<CreateDAOProposalContext>();

  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();

  const {
    setValue,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<CreateDAOTokenTransferForm>();

  if (proposalType !== DAOProposalType.TokenTransfer) {
    setValue("type", DAOProposalType.TokenTransfer);
  }

  /*
   * TODO: Replace Assets Input with Dropdown
   * const assetDropdownOptions =
   *   tokenBalances
   *     ?.filter((asset: TokenBalance) => asset.symbol !== "ℏ")
   *     ?.map((asset: TokenBalance) => {
   *       const { symbol, tokenId } = asset;
   *       return {
   *         label: symbol,
   *         value: tokenId,
   *       };
   *      }) ?? [];
   */

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

      <Flex alignItems="center" gap="1" justifyContent={"end"}>
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
        <Button
          variant={"primary"}
          marginTop={"4"}
          onClick={async () => {
            await DexService.associateTokenToSafe(getValues().tokenId, daoAccountId, signer);
          }}
        >
          Associate token
        </Button>
      </Flex>
      {/*
       *  TODO: Replace Assets Input with Dropdown
       *  <FormDropdown
       *   label="Assets"
       *   placeholder="Select an asset"
       *   data={assetDropdownOptions}
       *   isInvalid={Boolean(errors?.tokenId)}
       *   errorMessage={errors?.tokenId && errors?.tokenId?.message}
       *   register={register("tokenId", {
       *     required: { value: true, message: "A token is required." },
       *     onChange: (e: ChangeEvent<HTMLSelectElement>) => setValue("tokenId", e.target.value),
       *   })}
       * />
       */}
      <FormInput<"amount">
        inputProps={{
          id: "amount",
          label: "Amount",
          type: "number",
          placeholder: "Enter amount",
          register: {
            ...register("amount", {
              required: { value: true, message: "An amount is required." },
              validate: (value: number) => {
                return value > 0 ? true : "Amount must be greater than 0.";
              },
            }),
          },
        }}
        isInvalid={Boolean(errors?.amount)}
        errorMessage={errors?.amount && errors?.amount?.message}
      />
    </Flex>
  );
}
