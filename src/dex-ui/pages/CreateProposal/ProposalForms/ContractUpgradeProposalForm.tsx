import { FormControl, Input, FormErrorMessage, Flex, Button, Spacer, Text, Box } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate, Link as ReachLink } from "react-router-dom";
import { LoadingDialog, TextEditor, Breadcrumb, ArrowLeftIcon } from "@dex-ui-components";
import { isValidUrl } from "@utils";
import { ContractUpgradeProposalFormData, CreateProposalLocationProps } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useCreateContractUpgradeProposal } from "@hooks";
import { Paths } from "@routes";
import { Page, PageHeader } from "@layouts";

export function ContractUpgradeProposalForm(): ReactElement {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ContractUpgradeProposalFormData>();

  const createContractUpgradeMutationResults = useCreateContractUpgradeProposal(handleSendProposesSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetCreateContractUpgradeTransaction,
  } = createContractUpgradeMutationResults;

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

  async function onSubmit(data: ContractUpgradeProposalFormData) {
    mutate({
      title: data.title,
      description: data.description,
      linkToDiscussion: data.linkToDiscussion,
      newContractProxyId: data.newContractProxyId,
      contractToUpgrade: data.contractToUpgrade,
    });
  }

  return (
    <Page
      header={
        <PageHeader
          leftContent={[<Text textStyle="h2">Create New Proposal</Text>]}
          rightContent={[
            <Breadcrumb
              to={`${Paths.Governance.absolute}/${Paths.Governance.CreateNewProposal}`}
              as={ReachLink}
              label="Back to Select Proposal Type"
              leftIcon={<ArrowLeftIcon />}
            />,
          ]}
        />
      }
      body={
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex flexDirection="column" alignItems="center" width="100%">
              <Box width="600px">
                <Text textStyle="h3">Contract Upgrade</Text>
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
                        minLength: { value: 107, message: "Please enter atleast 100 characters in the description." },
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
                  <FormControl isInvalid={Boolean(errors.newContractProxyId)}>
                    <Input
                      variant="form-input"
                      id="newContractProxyId"
                      placeholder="New Implementation Address"
                      {...register("newContractProxyId", {
                        required: { value: true, message: "Address is required." },
                      })}
                    />
                    <FormErrorMessage>
                      {errors.newContractProxyId && errors.newContractProxyId.message}
                    </FormErrorMessage>
                  </FormControl>
                  <FormControl isInvalid={Boolean(errors.contractToUpgrade)}>
                    <Input
                      variant="form-input"
                      id="contractToUpgrade"
                      placeholder="Proxy Address"
                      {...register("contractToUpgrade", {
                        required: { value: true, message: "Proxy Address is required." },
                      })}
                    />
                    <FormErrorMessage>{errors.contractToUpgrade && errors.contractToUpgrade.message}</FormErrorMessage>
                  </FormControl>
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
                resetCreateContractUpgradeTransaction();
              },
            }}
          />
        </>
      }
    />
  );
}
