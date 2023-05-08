import { FormControl, Input, FormErrorMessage, Flex, Button, Spacer } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { ReactElement } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { TextEditor } from "../../../../../dex-ui-components";
import { LoadingDialog } from "../../../../../dex-ui-components";
import { CreateProposalType } from "../../../../hooks/governance/types";
import { useContractUpgradeProposalDetails } from "./useContractUpgradeProposalDetails";
import { CreateProposalLocationProps } from "../../CreateProposal";
import { isValidUrl } from "@pages";

interface ContractUpgradeProposalFormData {
  title: string;
  description: string;
  linkToDiscussion: string;
  abiFile: string;
  abiFileName: string;
  newImplementationAddress: string;
  proxyAddress: string;
}

export function ContractUpgradeProposalForm(): ReactElement {
  const navigate = useNavigate();
  const {
    handleSubmit,
    register,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContractUpgradeProposalFormData>();

  const handleCancelClick = () => navigate("/governance");

  const { createProposal, isLoadingDialogOpen, loadingDialogMessage, isErrorDialogOpen, errorDialogMessage } =
    useContractUpgradeProposalDetails();

  async function onSubmit(data: ContractUpgradeProposalFormData) {
    createProposal.mutate({
      type: CreateProposalType.ContractUpgrade,
      proposalData: {
        title: data.title,
        description: data.description,
        linkToDiscussion: data.linkToDiscussion,
        implementationAddress: data.newImplementationAddress,
        proxyAddress: data.proxyAddress,
      },
    });
  }

  function handleErrorDialogDismissButtonClicked() {
    createProposal.reset();
  }

  /**
   * TODO: Making the Location Props in Success to show the Notification in Proposal List Page,
   *       Need to Implement some state management with React Query like Immer.js
   */
  if (createProposal.isSuccess) {
    const createProposalLocationProps = {
      state: {
        proposalTitle: getValues("title"),
        proposalTransactionId: createProposal.data.transactionId.toString(),
        isProposalCreationSuccessful: true,
      } as CreateProposalLocationProps,
    };
    navigate("/governance", createProposalLocationProps);
  }

  return (
    <>
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
          <FormControl isInvalid={Boolean(errors.newImplementationAddress)}>
            <Input
              variant="form-input"
              id="newImplementationAddress"
              placeholder="New Implementation Address"
              {...register("newImplementationAddress", {
                required: { value: true, message: "Address is required." },
              })}
            />
            <FormErrorMessage>
              {errors.newImplementationAddress && errors.newImplementationAddress.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.proxyAddress)}>
            <Input
              variant="form-input"
              id="proxyAddress"
              placeholder="Proxy Address"
              {...register("proxyAddress", {
                required: { value: true, message: "Proxy Address is required." },
              })}
            />
            <FormErrorMessage>{errors.proxyAddress && errors.proxyAddress.message}</FormErrorMessage>
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
              isLoading={isSubmitting}
              alignSelf="end"
            >
              Publish
            </Button>
          </Flex>
        </Flex>
      </form>
      <LoadingDialog isOpen={isLoadingDialogOpen} message={loadingDialogMessage} />
      <LoadingDialog
        isOpen={isErrorDialogOpen}
        message={errorDialogMessage}
        icon={<WarningIcon h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: handleErrorDialogDismissButtonClicked,
        }}
      />
    </>
  );
}
