import { Button, Flex, FormControl, FormErrorMessage, Input, Spacer } from "@chakra-ui/react";
import { ReactElement } from "react";
import { useForm } from "react-hook-form";
import { TextEditor } from "../../../../dex-ui-components";
import { useDexContext } from "../../../hooks";

type TokenTransferProposalFormData = {
  title: string;
  description: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: number;
};

export function TokenTransferProposalForm(): ReactElement {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<TokenTransferProposalFormData>();

  async function onSubmit(data: TokenTransferProposalFormData) {
    await governance.createTransferTokenProposal({
      title: data.title,
      // TODO: Proposal Contract functions do not handle both title and description yet.
      // description: data.description,
      accountToTransferTo: data.accountToTransferTo,
      tokenToTransfer: data.tokenToTransfer,
      amountToTransfer: data.amountToTransfer,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex direction="column" gap="0.5rem">
        <FormControl isInvalid={Boolean(errors.title)}>
          <Input
            variant="form-input"
            id="title"
            placeholder="Proposal Title"
            {...register("title", {
              required: { value: true, message: "A title is required." },
            })}
          />
          <FormErrorMessage>{errors.title && errors.title.message}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <TextEditor id="description" placeholder="Description" />
        </FormControl>
        <FormControl isInvalid={Boolean(errors.accountToTransferTo)}>
          <Input
            variant="form-input"
            id="accountToTransferTo"
            placeholder="Target Wallet Id (Account Id)"
            {...register("accountToTransferTo", {
              required: { value: true, message: "A target wallet id is required." },
              maxLength: { value: 12, message: "Wallet id must be 12 or less characters." },
            })}
          />
          <FormErrorMessage>{errors.accountToTransferTo && errors.accountToTransferTo.message}</FormErrorMessage>
        </FormControl>
        <Flex direction="row" gap="0.5rem">
          <FormControl isInvalid={Boolean(errors.tokenToTransfer)}>
            <Input
              variant="form-input"
              id="tokenToTransfer"
              placeholder="Token To Transfer (Token Id)"
              {...register("tokenToTransfer", {
                required: { value: true, message: "A token id is required." },
                maxLength: { value: 12, message: "Token id must be 12 or less characters." },
              })}
            />
            <FormErrorMessage>{errors.tokenToTransfer && errors.tokenToTransfer.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.amountToTransfer)}>
            {/** NOTE: This may be replaced with the TokenAmountInput in future iterations. */}
            <Input
              type="number"
              variant="form-input"
              id="amountToTransfer"
              placeholder="Amount to Transfer"
              {...register("amountToTransfer", {
                valueAsNumber: true,
                required: { value: true, message: "A token amount is required." },
                min: { value: 0, message: "A token amount must be greater than 0." },
              })}
            />
            <FormErrorMessage>{errors.amountToTransfer && errors.amountToTransfer.message}</FormErrorMessage>
          </FormControl>
        </Flex>
        <Spacer padding="0.5rem" />
        <Button
          type="submit"
          variant="primary"
          padding="10px 27px"
          height="40px"
          isLoading={isSubmitting}
          alignSelf="end"
        >
          Publish
        </Button>
      </Flex>
    </form>
  );
}
