import { Button, Flex, FormControl, FormErrorMessage, Input, Spacer, Text, Box } from "@chakra-ui/react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TextEditor, Breadcrumb, LoadingDialog } from "@shared/ui-kit";
import { CreateProposalLocationProps, TextProposalFormData } from "./types";
import { isValidUrl } from "@dex/utils";
import { Page, PageHeader } from "@dex/layouts";
import { Paths } from "@dex/routes";
import { useCreateTextProposal } from "@dex/hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { WarningIcon } from "@chakra-ui/icons";
import { DEFAULT_NFT_TOKEN_SERIAL_ID, EDITOR_DEFAULT_CHARACTER_COUNT } from "@dex/services";

export function TextProposalForm() {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TextProposalFormData>();

  const createTextProposalMutationResults = useCreateTextProposal(handleSendProposesSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetCreateTextProposalTransaction,
  } = createTextProposalMutationResults;

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

  async function onSubmit(data: TextProposalFormData) {
    mutate({
      title: data.title,
      description: data.description,
      linkToDiscussion: data.linkToDiscussion,
      nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
    });
  }

  return (
    <Page
      header={
        <PageHeader
          leftContent={[
            <Text textStyle="h2" key="1">
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
                <Text textStyle="h3">Text Proposal</Text>
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
                  <Spacer padding="0.5rem" />
                  <Flex direction="row" justifyContent="right" gap="0.5rem">
                    <Button variant="secondary" padding="10px 27px" height="40px" onClick={handleCancelClick}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" padding="10px 27px" height="40px" isLoading={isLoading}>
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
                resetCreateTextProposalTransaction();
              },
            }}
          />
        </>
      }
    />
  );
}
