import { FormControl, Input, FormErrorMessage, Flex, Button, Spacer, Text } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { ReactElement, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Color, TextEditor } from "../../../../../dex-ui-components";
import { FileUploader, LoadingDialog } from "../../../../../dex-ui-components";
import { CreateProposalType } from "../../../../hooks/governance/types";
import { useDexContext } from "../../../../hooks";
import { useContractUpgradeProposalDetails } from "./useContractUpgradeProposalDetails";
import { CreateProposalLocationProps } from "../../CreateProposal";

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
    setValue,
    reset,
    getValues,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContractUpgradeProposalFormData>();

  const handleCancelClick = () => navigate("/governance");

  const {
    deployContract,
    createProposal,
    isLoadingDialogOpen,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
  } = useContractUpgradeProposalDetails();

  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const [fileName, setFileName] = useState("");

  const onFileReadAction = (file: string, fileName: string) => {
    resetServerState();
    setFileName(fileName);
    deployContract.mutate({ abiFile: file });
  };

  async function onSubmit(data: ContractUpgradeProposalFormData) {
    resetServerState();
    const signer = wallet.getSigner();
    createProposal.mutate({
      type: CreateProposalType.ContractUpgrade,
      proposalData: {
        title: data.title,
        description: data.description,
        linkToDiscussion: data.linkToDiscussion,
        implementationAddress: data.newImplementationAddress,
        proxyAddress: data.proxyAddress,
        signer,
      },
    });
  }

  function handleErrorDialogDismissButtonClicked() {
    resetServerState();
    resetFormValues();
  }

  function resetServerState() {
    deployContract.reset();
    createProposal.reset();
  }

  function resetFormValues() {
    setFileName("");
    reset({
      newImplementationAddress: "",
      proxyAddress: "",
    });
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

  /**
   *  TODO: Setting the Disabled Form New Implementation Address field once the deploy contract return id
   *        Hard Coded the Value for Proxy Address for now, need to change once the flow is decided.
   *        Use Effect is needed here since we updating the component and Validating too with `shouldValidate` property
   *        it re-renders the form again and can stuck in infinite loop.
   */
  useEffect(() => {
    if (deployContract.data?.id) {
      setValue("newImplementationAddress", deployContract.data?.id, { shouldValidate: true });
      // TODO: Hard Coded proxy Address for now, need to discuss the final flow
      setValue("proxyAddress", "0.0.49078140", { shouldValidate: true });
    }
  }, [deployContract.data?.id]);

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
          <FormControl>
            <Flex direction="column" justifyContent="right" gap="0.5rem">
              <FileUploader
                id="abiFile"
                title="Drag and Drop your ABI file"
                subTitle="or click to browse your files"
                onHoverTitle="Drop your ABI file here ..."
                onFileRead={onFileReadAction}
              />
              {fileName.length !== 0 ? (
                <Text textStyle="b3" color={Color.Blue_02}>
                  {fileName}
                </Text>
              ) : null}
            </Flex>
          </FormControl>
          <FormControl isInvalid={Boolean(errors.newImplementationAddress)}>
            <Input
              disabled
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
