import { useFormContext } from "react-hook-form";
import { CreateATokenDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { CancelledStepIcon, Color, FormInput, Text } from "@shared/ui-kit";
import { useFetchTokenData } from "@dex/hooks";
import { debounce } from "ts-debounce";
import { CircularProgress, Divider, Flex } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { DEBOUNCE_TIME, MirrorNodeTokenById } from "@dex/services";
import { checkForValidTokenId } from "@dex/utils";
import { ChangeEvent } from "react";
import { DefaultCreateATokenDAOFormData } from "./constants";
import { isNotNil } from "ramda";
import { TokenType } from "@dao/services";

export function ExistingTokenDAOGovernanceForm() {
  const {
    register,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useFormContext<CreateATokenDAOForm>();
  const formValues = getValues();
  const { governance } = isNotNil(formValues.governance) ? formValues : DefaultCreateATokenDAOFormData;
  const { refetch, isFetching, isError } = useFetchTokenData({
    tokenId: governance?.existingToken?.id,
    handleTokenSuccessResponse,
    handleTokenErrorResponse,
  });

  function isValidTokenId() {
    return (
      isNotNil(governance?.existingToken?.mirrorNodeTokenId) &&
      checkForValidTokenId(governance?.existingToken?.mirrorNodeTokenId) &&
      governance?.existingToken?.tokenType === TokenType.FungibleToken
    );
  }

  function handleTokenSuccessResponse(tokenData: MirrorNodeTokenById) {
    setValue("governance.existingToken.decimals", Number(tokenData.data.decimals));
    setValue("governance.existingToken.id", tokenData.data.token_id, { shouldValidate: true });
    setValue("governance.existingToken.name", tokenData.data.name);
    setValue("governance.existingToken.symbol", tokenData.data.symbol);
    setValue("governance.existingToken.initialSupply", Number(tokenData.data.initial_supply));
    setValue("governance.existingToken.supplyKey", tokenData.data.supply_key.key);
    setValue("governance.existingToken.supplyKey", tokenData.data.supply_key.key);
    setValue("governance.existingToken.mirrorNodeTokenId", tokenData?.data.token_id, { shouldValidate: true });
    setValue("governance.existingToken.tokenType", tokenData?.data.type, { shouldValidate: true });
    trigger("governance.existingToken.id");
  }

  function handleTokenErrorResponse() {
    setValue("governance.existingToken.mirrorNodeTokenId", undefined);
    setValue("governance.existingToken.name", "");
    setValue("governance.existingToken.symbol", "");
    trigger("governance.existingToken.id");
  }

  function getIconForTokenIdField() {
    if (isFetching)
      return <CircularProgress isIndeterminate color={Color.Primary._500} size="1.5rem" marginRight="0.5rem" />;
    if (isError) return <CancelledStepIcon boxSize="1rem" color={Color.Destructive._500} marginRight="0.5rem" />;
    if (isValidTokenId()) return <CheckCircleIcon color={Color.Success._500} boxSize="1rem" marginRight="0.5rem" />;
    return undefined;
  }

  function handleTokenIdChange(event: ChangeEvent<HTMLInputElement>) {
    if (checkForValidTokenId(event.target.value)) {
      refetch();
    }
  }

  return (
    <>
      <DAOFormContainer>
        <Flex direction="column" gap="1px">
          <FormInput<"governance.existingToken.id">
            inputProps={{
              id: "governance.existingToken.id",
              label: "Token ID",
              type: "text",
              placeholder: "Enter token id",
              unit: getIconForTokenIdField(),
              register: {
                ...register("governance.existingToken.id", {
                  required: { value: true, message: "A token id is required." },
                  validate: () => isValidTokenId() || "Enter a Valid Fungible Token Id.",
                  onChange: debounce(handleTokenIdChange, DEBOUNCE_TIME),
                }),
              },
            }}
            isInvalid={Boolean(errors.governance?.existingToken?.id)}
            errorMessage={errors.governance?.existingToken?.id && errors.governance?.existingToken?.id.message}
          />
        </Flex>
        {governance.existingToken.name && governance.existingToken.symbol ? (
          <Flex direction="row" flex="1" paddingTop="0.6rem" paddingBottom="0.6rem">
            <Flex direction="column" flex="3">
              <Text.P_Small_Medium>Name</Text.P_Small_Medium>
              <Text.P_Medium_Regular>{governance.existingToken.name}</Text.P_Medium_Regular>
            </Flex>
            <Flex direction="row" flex="1" alignItems="flex-start" gap="4rem">
              <Divider orientation="vertical" />
              <Flex direction="column">
                <Text.P_Small_Medium>Symbol</Text.P_Small_Medium>
                <Text.P_Medium_Regular>{governance.existingToken.symbol}</Text.P_Medium_Regular>
              </Flex>
            </Flex>
          </Flex>
        ) : undefined}
        <FormInput<"governance.existingToken.treasuryWalletAccountId">
          inputProps={{
            id: "governance.existingToken.treasuryWalletAccountId",
            label: "Treasury account id (wallet address)",
            type: "text",
            placeholder: "Enter account id",
            register: {
              ...register("governance.existingToken.treasuryWalletAccountId", {
                required: { value: true, message: "A treasury account id is required." },
              }),
            },
          }}
          isInvalid={Boolean(errors.governance?.existingToken?.treasuryWalletAccountId)}
          errorMessage={
            errors.governance?.existingToken?.treasuryWalletAccountId &&
            errors.governance?.existingToken?.treasuryWalletAccountId.message
          }
        />
      </DAOFormContainer>
    </>
  );
}
