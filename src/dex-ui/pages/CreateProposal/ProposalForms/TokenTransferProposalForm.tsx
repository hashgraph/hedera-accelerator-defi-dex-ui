import { Button, Flex, FormControl, FormErrorMessage, Input, Spacer } from "@chakra-ui/react";
import { ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TextEditor } from "../../../../dex-ui-components";
import { useDexContext } from "../../../hooks";
import { ProposalType } from "../../../store/governanceSlice";

interface TokenTransferProposalFormData {
  title: string;
  description: string;
  linkToDiscussion: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: number;
}

export function TokenTransferProposalForm(): ReactElement {
  const { governance } = useDexContext(({ governance }) => ({ governance }));
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    control,
    formState: { errors, isSubmitting },
  } = useForm<TokenTransferProposalFormData>();

  const handleCancelClick = () => navigate("/governance");

  async function onSubmit(data: TokenTransferProposalFormData) {
    await governance.createProposal(ProposalType.TokenTransfer, {
      title: data.title,
      /**
       * TODO: Add ref data controller for Rich Text Editor to retrieve description value from react-hook-form.
       * Need to update contract logs to emit description and linkToDiscussion.
       * */
      description: "A description of this proposal.",
      linkToDiscussion: data.linkToDiscussion,
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
        <FormControl isInvalid={Boolean(errors.description)}>
          <Controller
            name="description"
            control={control}
            rules={{
              required: { value: true, message: "Description is required." },
              minLength: { value: 107, message: "Please enter atleast 100 characters in the description." },
              validate: (value) => value.length >= 107,
            }}
            render={({ field }) => (
              <TextEditor
                {...field}
                id="description"
                placeholder="Description"
                onError={Boolean(errors.description)}
                onChange={(text) => field.onChange(text)}
                value={field.value || ""}
              />
            )}
          />
          <FormErrorMessage>{errors.description && errors.description.message}</FormErrorMessage>
        </FormControl>
        <FormControl>
          <Input
            variant="form-input"
            id="linkToDiscussion"
            placeholder="Link to Discussion (optional)"
            {...register("linkToDiscussion")}
          />
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
        <Flex direction="row" justifyContent="right" gap="0.5rem">
          <Button variant="secondary" padding="10px 27px" height="40px" onClick={handleCancelClick}>
            Cancel
          </Button>
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
      </Flex>
    </form>
  );
}
