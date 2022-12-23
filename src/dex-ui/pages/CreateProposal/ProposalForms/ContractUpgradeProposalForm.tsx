import { FormControl, Input, FormErrorMessage, Flex, Button, Spacer, Text } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { ReactElement, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Color, TextEditor } from "../../../../dex-ui-components";
import { FileUploader, LoadingDialog } from "../../../../dex-ui-components";
import { useDeployContract } from "../../../hooks/governance";
import { useCreateProposal } from "../../../hooks/governance";
import { CreateProposalType } from "../../../hooks/governance/types";
import { useDexContext } from "../../../hooks";

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
    formState: { errors, isSubmitting },
  } = useForm<ContractUpgradeProposalFormData>();

  const handleCancelClick = () => navigate("/governance");
  const deployContract = useDeployContract();
  const createProposal = useCreateProposal();
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

  if (createProposal.isSuccess) {
    navigate("/governance");
  }

  if (deployContract.isSuccess && deployContract.data?.id) {
    setValue("newImplementationAddress", deployContract.data?.id ?? "", { shouldValidate: true });
    // TODO: Hard Coded proxy Address for now, need to discuss the final flow
    setValue("proxyAddress", "0.0.49078140", { shouldValidate: true });
  }

  return (
    <>
      <LoadingDialog isOpen={deployContract.isLoading} message={"Fetching Details.. Please wait"} />
      <LoadingDialog isOpen={createProposal.isLoading} message={"Submitting.. Please wait"} />
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
            <TextEditor id="description" placeholder="Description" {...register("description")} />
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
              {
                fileName.length !== 0 && (
                  <Text textStyle="b3" color={Color.Blue_02}>
                    {" "}
                    {fileName}
                  </Text>
                ) // TODO: Place for the file name to show
              }
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
      <LoadingDialog
        isOpen={deployContract.isError}
        message={deployContract.error?.message ?? ""}
        icon={<WarningIcon color="#EF5C5C" h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            resetFormValues();
            resetServerState();
          },
        }}
      />
      <LoadingDialog
        isOpen={createProposal.isError}
        message={createProposal.error?.message ?? ""}
        icon={<WarningIcon color="#EF5C5C" h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            resetServerState();
            resetFormValues();
          },
        }}
      />
    </>
  );
}
