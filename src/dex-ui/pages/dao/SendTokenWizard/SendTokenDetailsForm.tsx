import { Text, Flex, Divider } from "@chakra-ui/react";
import { HashScanLink, HashscanData, FormInput } from "@dex-ui-components";
import { useFormContext } from "react-hook-form";
import { useOutletContext } from "react-router-dom";
import { SendTokenForm, SendTokenWizardContext } from "./types";

export function SendTokenDetailsForm() {
  const { safeAccountId } = useOutletContext<SendTokenWizardContext>();
  const {
    register,
    formState: { errors },
  } = useFormContext<SendTokenForm>();
  return (
    <Flex direction="column" gap="4" width="100%">
      <Flex direction="column" alignItems="left" gap="1">
        <Text textStyle="p small medium">Sending from</Text>
        <HashScanLink id={safeAccountId} type={HashscanData.Account} />
      </Flex>
      <Divider />
      <FormInput<"recipientAccountId">
        inputProps={{
          id: "tokenId",
          label: "Recipient Account ID",
          type: "text",
          placeholder: "Enter recipient account ID",
          register: {
            ...register("recipientAccountId", {
              required: { value: true, message: "A recipient account ID is required." },
            }),
          },
        }}
        isInvalid={Boolean(errors.recipientAccountId)}
        errorMessage={errors.recipientAccountId && errors.recipientAccountId.message}
      />
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
        }}
        isInvalid={Boolean(errors.tokenId)}
        errorMessage={errors.tokenId && errors.tokenId.message}
      />
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
        isInvalid={Boolean(errors.amount)}
        errorMessage={errors.amount && errors.amount.message}
      />
    </Flex>
  );
}
