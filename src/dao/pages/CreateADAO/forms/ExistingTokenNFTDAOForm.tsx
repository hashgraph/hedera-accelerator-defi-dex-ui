import { Text, CancelledStepIcon, CheckCircleIcon, Color, FormInput } from "@shared/ui-kit";
import { CreateANFTDAOForm } from "../types";
import { useFormContext } from "react-hook-form";
import { DAOFormContainer } from "./DAOFormContainer";
import { CircularProgress, Divider, Flex } from "@chakra-ui/react";
import { checkForValidAccountId, checkForValidTokenId } from "@dex/utils";
import { useFetchTokenData } from "@dex/hooks";
import { ChangeEvent } from "react";
import { DEBOUNCE_TIME, MirrorNodeTokenById } from "@dex/services";
import { debounce } from "ts-debounce";
import { TokenType } from "@dao/services";
import { isNotNil } from "ramda";

export function ExistingTokenNFTDAOForm() {
  const {
    register,
    getValues,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<CreateANFTDAOForm>();

  const formValues = getValues();
  const { governance } = formValues;

  const { refetch, isFetching, isError } = useFetchTokenData({
    tokenId: governance?.existingNFT?.id,
    handleTokenSuccessResponse,
    handleTokenErrorResponse,
  });

  function isValidNFTId() {
    return (
      isNotNil(governance?.existingNFT?.id) &&
      checkForValidTokenId(governance?.existingNFT?.id) &&
      governance?.existingNFT?.tokenType === TokenType.NFT
    );
  }

  function handleTokenSuccessResponse(tokenData: MirrorNodeTokenById) {
    setValue("governance.existingNFT.id", tokenData.data.token_id, { shouldValidate: true });
    setValue("governance.existingNFT.name", tokenData.data.name);
    setValue("governance.existingNFT.symbol", tokenData.data.symbol);
    setValue("governance.existingNFT.maxSupply", Number(tokenData.data.max_supply));
    setValue("governance.existingNFT.tokenWalletAddress", tokenData.data.treasury_account_id);
    setValue("governance.existingNFT.treasuryWalletAccountId", tokenData?.data.treasury_account_id, {
      shouldValidate: true,
    });
    setValue("governance.existingNFT.tokenType", tokenData?.data.type, {
      shouldValidate: true,
    });
    trigger("governance.existingNFT.id");
  }

  function handleTokenErrorResponse() {
    setValue("governance.existingNFT.name", "");
    setValue("governance.existingNFT.symbol", "");
    trigger("governance.existingNFT.id");
  }

  function getIconForTokenIdField() {
    if (isFetching)
      return <CircularProgress isIndeterminate color={Color.Primary._500} size="1.5rem" marginRight="0.5rem" />;
    if (isError) return <CancelledStepIcon boxSize="1rem" color={Color.Destructive._500} marginRight="0.5rem" />;
    if (isValidNFTId()) return <CheckCircleIcon color={Color.Success._500} boxSize="1.2rem" marginRight="0.5rem" />;
    return undefined;
  }

  function handleTokenIdChange(event: ChangeEvent<HTMLInputElement>) {
    if (checkForValidTokenId(event.target.value)) {
      refetch();
    }
  }
  return (
    <Flex gap="1.5rem" direction="column" width="100%">
      <DAOFormContainer>
        <FormInput<"governance.existingNFT.id">
          inputProps={{
            id: "governance.existingNFT.id",
            label: "NFT ID",
            type: "text",
            placeholder: "Enter NFT Id",
            unit: getIconForTokenIdField(),
            register: {
              ...register("governance.existingNFT.id", {
                required: { value: true, message: "A NFT id is required." },
                validate: () => isValidNFTId() || "Enter a Valid NFT Id.",
                onChange: debounce(handleTokenIdChange, DEBOUNCE_TIME),
              }),
            },
          }}
          isInvalid={Boolean(errors.governance?.existingNFT?.id)}
          errorMessage={errors.governance?.existingNFT?.id && errors.governance?.existingNFT.id.message}
        />
        {governance?.existingNFT?.name && governance?.existingNFT?.symbol ? (
          <Flex direction="row" flex="1" paddingTop="0.6rem" paddingBottom="0.6rem">
            <Flex direction="column" flex="3">
              <Text.P_Small_Medium>Name</Text.P_Small_Medium>
              <Text.P_Medium_Regular>{governance.existingNFT.name}</Text.P_Medium_Regular>
            </Flex>
            <Flex direction="row" flex="1" alignItems="flex-start" gap="4rem">
              <Divider orientation="vertical" />
              <Flex direction="column">
                <Text.P_Small_Medium>Symbol</Text.P_Small_Medium>
                <Text.P_Medium_Regular>{governance.existingNFT.symbol}</Text.P_Medium_Regular>
              </Flex>
            </Flex>
          </Flex>
        ) : undefined}
        <FormInput<"governance.existingNFT.treasuryWalletAccountId">
          inputProps={{
            id: "governance.existingNFT.treasuryWalletAccountId",
            label: "Treasury wallet account id",
            type: "text",
            placeholder: "Enter wallet account id",
            register: {
              ...register("governance.existingNFT.treasuryWalletAccountId", {
                required: { value: true, message: "A treasury account id is required." },
                validate: (value) => checkForValidAccountId(value) || "Invalid address, please, enter a different one.",
              }),
            },
          }}
          isInvalid={Boolean(errors.governance?.existingNFT?.tokenWalletAddress)}
          errorMessage={
            errors.governance?.existingNFT?.tokenWalletAddress &&
            errors.governance?.existingNFT?.tokenWalletAddress?.message
          }
        />
      </DAOFormContainer>
    </Flex>
  );
}
