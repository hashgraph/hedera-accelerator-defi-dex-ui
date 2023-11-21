import { Button, Flex, FormControl, FormErrorMessage, Input, Spacer, Text, Box } from "@chakra-ui/react";
import { ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TextEditor, Breadcrumb, LoadingDialog } from "@shared/ui-kit";
import { useCreateTokenTransferProposal } from "@dex/hooks";
import { Page, PageHeader } from "@dex/layouts";
import { isValidUrl } from "@dex/utils";
import { Paths } from "@dex/routes";
import { TransactionResponse } from "@hashgraph/sdk";
import { CreateProposalLocationProps, TokenTransferProposalFormData } from "./types";
import { WarningIcon } from "@chakra-ui/icons";
import { DEFAULT_NFT_TOKEN_SERIAL_ID, EDITOR_DEFAULT_CHARACTER_COUNT } from "@dex/services";

export function TokenTransferProposalForm(): ReactElement {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TokenTransferProposalFormData>();

  const createTokenTransferMutationResults = useCreateTokenTransferProposal(handleSendProposesSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetCreateTokenTransferProposalTransaction,
  } = createTokenTransferMutationResults;

  function handleSendProposesSuccess(transactionResponse: TransactionResponse) {
    const createProposalLocationProps = {
      state: {
        proposalTitle: getValues().title,
        proposalTransactionId: transactionResponse?.transactionId.toString(),
        isProposalCreationSuccessful: true,
      } as CreateProposalLocationProps,
    };
    reset();
    navigate(Paths.Governance.absolute, createProposalLocationProps);
  }

  function handleCancelClick() {
    reset();
    navigate(Paths.Governance.absolute);
  }

  async function onSubmit(data: TokenTransferProposalFormData) {
    mutate({
      title: data.title,
      /**
       * TODO: Add ref data controller for Rich Text Editor to retrieve description value from react-hook-form.
       * Need to update contract logs to emit description and linkToDiscussion.
       * */
      description: data.description,
      linkToDiscussion: data.linkToDiscussion,
      accountToTransferTo: data.accountToTransferTo,
      tokenToTransfer: data.tokenToTransfer,
      amountToTransfer: data.amountToTransfer,
      nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
    });
  }

  return (
    <Page
      header={
        <PageHeader
          leftContent={[
            <Text key="1" textStyle="h2">
              Create New Proposal
            </Text>,
          ]}
          rightContent={[
            <Breadcrumb
              key="2"
              to={`${Paths.Governance.absolute}/${Paths.Governance.CreateNewProposal}`}
              label="Back to Select Proposal Type"
            />,
          ]}
        />
      }
      body={
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex flexDirection="column" alignItems="center" width="100%">
              <Box width="600px">
                <Text textStyle="h3">Token Transfer</Text>
                <Spacer padding="0.5rem" />
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
                        validate: (value) =>
                          (value.length > 0 && value.length <= 240 + EDITOR_DEFAULT_CHARACTER_COUNT) ||
                          "Maximum character count for the description is 240.",
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
                  <FormControl isInvalid={Boolean(errors.linkToDiscussion)}>
                    <Input
                      variant="form-input"
                      id="linkToDiscussion"
                      placeholder="Link to Discussion (optional)"
                      {...register("linkToDiscussion", {
                        validate: (value) => isValidUrl(value) || "Enter a Valid URL.",
                      })}
                    />
                    <FormErrorMessage>{errors.linkToDiscussion && errors.linkToDiscussion.message}</FormErrorMessage>
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
                    <FormErrorMessage>
                      {errors.accountToTransferTo && errors.accountToTransferTo.message}
                    </FormErrorMessage>
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
                      <Input
                        type="number"
                        step="any"
                        variant="form-input"
                        id="amountToTransfer"
                        placeholder="Amount to Transfer"
                        {...register("amountToTransfer", {
                          valueAsNumber: true,
                          required: { value: true, message: "A token amount is required." },
                          validate: (value) => value > 0 || "A token amount must be greater than 0.",
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
                      isLoading={isLoading}
                      alignSelf="end"
                    >
                      Publish
                    </Button>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </form>
          <LoadingDialog
            isOpen={isLoading}
            message={"Please confirm the proposal creation transaction in your wallet to proceed."}
          />
          <LoadingDialog
            isOpen={isError}
            message={error?.message ?? ""}
            icon={<WarningIcon h={10} w={10} />}
            buttonConfig={{
              text: "Dismiss",
              onClick: () => {
                resetCreateTokenTransferProposalTransaction();
              },
            }}
          />
        </>
      }
    />
  );
}
