import { useFormContext } from "react-hook-form";
import { CreateATokenDAOForm } from "../types";
import { DAOFormContainer } from "./DAOFormContainer";
import { Color, FormInput } from "@dex-ui-components";
import { useFetchTokenData } from "@hooks";
import { debounce } from "ts-debounce";
import { Flex, Text, Divider, CircularProgress } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { DEBOUNCE_TIME, MirrorNodeTokenById } from "@services";
import { checkForValidTokenId } from "@utils";
import { ChangeEvent } from "react";

export function ExistingTokenDAOGovernanceForm() {
  const {
    register,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useFormContext<CreateATokenDAOForm>();
  const formValues = getValues();
  const { governance } = formValues;
  const { refetch, isFetching, isSuccess } = useFetchTokenData({
    tokenId: governance.existingToken.id,
    handleTokenSuccessResponse,
    handleTokenErrorResponse,
  });

  function isTokenIdValid() {
    return checkForValidTokenId(governance.existingToken.mirrorNodeTokenId ?? "") || isSuccess;
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
    trigger("governance.existingToken.id");
  }

  function handleTokenErrorResponse() {
    setValue("governance.existingToken.mirrorNodeTokenId", undefined);
    setValue("governance.existingToken.name", "");
    setValue("governance.existingToken.symbol", "");
    trigger("governance.existingToken.id");
  }

  function getIconForTokenIdField() {
    if (isFetching) return <CircularProgress isIndeterminate color={Color.Primary._500} size="25px" />;
    if (isSuccess && governance.existingToken.id.length > 0) {
      return <CheckCircleIcon color={Color.Success._500} />;
    }
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
                  validate: () => isTokenIdValid() || "Enter a Valid Token Id.",
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
              <Text textStyle="p small medium">Name</Text>
              <Text textStyle="p medium regular">{governance.existingToken.name}</Text>
            </Flex>
            <Flex direction="row" flex="1" alignItems="flex-start" gap="4rem">
              <Divider orientation="vertical" />
              <Flex direction="column">
                <Text textStyle="p small medium">Symbol</Text>
                <Text textStyle="p medium regular">{governance.existingToken.symbol}</Text>
              </Flex>
            </Flex>
          </Flex>
        ) : undefined}
        <FormInput<"governance.existingToken.treasuryWalletAccountId">
          inputProps={{
            id: "governance.existingToken.treasuryWalletAccountId",
            label: "Treasury wallet account id",
            type: "text",
            placeholder: "Enter wallet account id",
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
