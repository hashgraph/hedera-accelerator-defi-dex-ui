import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { FormProvider, useForm } from "react-hook-form";
import { useSteps } from "chakra-ui-steps";
import { Color, LoadingDialog, StepperV2 } from "@dex-ui-components";
import { Page } from "@layouts";
import {
  DAODetailsForm,
  DAOTypeForm,
  TokenDAOGovernanceForm,
  TokenDAOVotingForm,
  TokenDAOReviewForm,
  MultiSigDAOGovernanceForm,
  MultiSigDAOVotingForm,
  MultiSigDAOReviewForm,
  NFTDAOGovernanceForm,
  NFTDAOVotingForm,
  NFTDAOReviewForm,
} from "./forms";
import { useNavigate } from "react-router-dom";
import {
  CreateADAOForm,
  CreateAMultiSigDAOForm,
  CreateATokenDAOForm,
  CreateANFTDAOForm,
  TokenDAOGovernanceData,
  DAOGovernanceTokenType,
} from "./types";
import { useCreateDAO } from "@hooks";
import { WarningIcon } from "@chakra-ui/icons";
import { TransactionResponse } from "@hashgraph/sdk";
import { Paths } from "@routes";
import { DAOType } from "@services";

export function CreateADAOPage() {
  const stepProps = useSteps({
    initialStep: 0,
  });
  const navigate = useNavigate();

  const createDAOPageForm = useForm<CreateADAOForm>({
    defaultValues: {
      name: "",
      description: "",
      logoUrl: "",
      isPublic: true,
      type: DAOType.GovernanceToken,
    },
  });
  const { getValues, trigger, handleSubmit, formState } = createDAOPageForm;

  const { isPublic, type, name, governance } = getValues();

  function handleCreateDAOSuccess(transactionResponse: TransactionResponse) {
    const createDAOSuccessMessage = `Created new 
    ${isPublic ? "public" : "private"} ${type} DAO "${name}".`;
    navigate(Paths.DAOs.absolute, {
      state: {
        createDAOSuccessMessage,
        transactionState: {
          transactionWaitingToBeSigned: false,
          successPayload: transactionResponse,
          errorMessage: "",
        },
      },
    });
  }

  const createDAO = useCreateDAO(handleCreateDAOSuccess);

  function GovernanceForm() {
    if (type === DAOType.GovernanceToken) return <TokenDAOGovernanceForm />;
    if (type === DAOType.MultiSig) return <MultiSigDAOGovernanceForm />;
    if (type === DAOType.NFT) return <NFTDAOGovernanceForm />;
    return <>Please select a DAO type to configure governance rules.</>;
  }

  function VotingForm() {
    if (type === DAOType.GovernanceToken) return <TokenDAOVotingForm />;
    if (type === DAOType.MultiSig) return <MultiSigDAOVotingForm />;
    if (type === DAOType.NFT) return <NFTDAOVotingForm />;
    return <>Please select a DAO type to configure voting rules.</>;
  }

  function ReviewForm() {
    if (type === DAOType.GovernanceToken) return <TokenDAOReviewForm />;
    if (type === DAOType.MultiSig) return <MultiSigDAOReviewForm />;
    if (type === DAOType.NFT) return <NFTDAOReviewForm />;
    return <></>;
  }

  const steps = [
    {
      label: "Details",
      content: <DAODetailsForm />,
    },
    { label: "Type", content: <DAOTypeForm /> },
    {
      label: "Governance",
      content: GovernanceForm(),
    },
    {
      label: "Voting",
      content: VotingForm(),
    },
    {
      label: "Review",
      content: ReviewForm(),
      isLoading: createDAO.isLoading,
      isError: createDAO.isError,
    },
  ];

  const { nextStep, prevStep, reset, activeStep } = stepProps;
  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;
  const previousStepLabel = isFirstStep ? "Cancel" : "Back";
  const nextStepLabel = isLastStep ? "Create DAO" : "Next >";

  function handleCancelClicked() {
    reset();
    navigate(Paths.DAOs.absolute);
  }

  async function validateStep(activeStep: number): Promise<boolean> {
    const triggerDefaultValidations = (): Promise<boolean> => Promise.resolve(true);
    switch (activeStep) {
      case 0: {
        return trigger(["name", "logoUrl", "isPublic", "description"]);
      }
      case 2: {
        if (
          type === DAOType.GovernanceToken &&
          (governance as TokenDAOGovernanceData).tokenType === DAOGovernanceTokenType.NewToken
        )
          return trigger(["governance.newToken.id", "governance.newToken.treasuryWalletAccountId"]);
        if (
          type === DAOType.GovernanceToken &&
          (governance as TokenDAOGovernanceData).tokenType === DAOGovernanceTokenType.ExistingToken
        )
          return trigger(["governance.existingToken.id", "governance.existingToken.treasuryWalletAccountId"]);
        if (type === DAOType.MultiSig) return trigger(["governance.admin"]);
        if (type === DAOType.NFT) return trigger(["governance.nft.id", "governance.nft.treasuryWalletAccountId"]);
        return triggerDefaultValidations();
      }
      case 3: {
        if (type === DAOType.GovernanceToken)
          return trigger(["voting.quorum", "voting.duration", "voting.lockingPeriod"]);
        if (type === DAOType.MultiSig) return trigger(["voting.threshold"]);
        if (type === DAOType.NFT) return trigger(["voting.quorum", "voting.duration", "voting.duration"]);
        return triggerDefaultValidations();
      }
      default: {
        return triggerDefaultValidations();
      }
    }
  }

  async function handleNextClicked() {
    const isStepDataValid = await validateStep(activeStep);
    if (isStepDataValid) nextStep();
  }

  /* TODO: Send Description and Links once the SC is ready */
  async function onSubmit(data: CreateADAOForm) {
    if (data.type === DAOType.GovernanceToken) {
      const tokenDAOData = data as CreateATokenDAOForm;
      const { governance, voting, type, name, logoUrl = "", isPublic } = tokenDAOData;
      return createDAO.mutate({
        type,
        name,
        logoUrl,
        isPrivate: !isPublic,
        tokenId:
          governance.tokenType === DAOGovernanceTokenType.NewToken
            ? governance.newToken.id
            : governance.existingToken.id,
        treasuryWalletAccountId:
          governance.tokenType === DAOGovernanceTokenType.NewToken
            ? governance.newToken.treasuryWalletAccountId
            : governance.existingToken.treasuryWalletAccountId,
        quorum: voting.quorum,
        votingDuration: voting.duration,
        lockingDuration: voting.lockingPeriod,
      });
    }
    if (data.type === DAOType.MultiSig) {
      const multiSigDAOData = data as CreateAMultiSigDAOForm;
      const { type, name, logoUrl = "", isPublic, governance, voting } = multiSigDAOData;
      return createDAO.mutate({
        type,
        admin: governance.admin,
        name,
        logoUrl,
        owners: governance.owners.map((owner) => owner.value),
        threshold: voting.threshold,
        isPrivate: !isPublic,
      });
    }
    if (data.type === DAOType.NFT) {
      const nftDAOData = data as CreateANFTDAOForm;
      const { type, name, logoUrl = "", isPublic, governance, voting } = nftDAOData;
      return createDAO.mutate({
        type,
        name,
        logoUrl,
        isPrivate: !isPublic,
        tokenId: governance.nft.id,
        treasuryWalletAccountId: governance.nft.treasuryWalletAccountId,
        quorum: voting.quorum,
        votingDuration: voting.duration,
        lockingDuration: voting.lockingPeriod,
      });
    }
  }

  return (
    <FormProvider {...createDAOPageForm}>
      <Page
        body={
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" alignItems="center" maxWidth="624px" margin="auto" gap="8" paddingTop="2rem">
              <Text textStyle="h4 medium">Create a DAO</Text>
              <StepperV2 steps={steps} {...stepProps} />
              <Flex width="100%">
                {isFirstStep ? (
                  <Button key="cancel" variant="secondary" onClick={handleCancelClicked}>
                    {previousStepLabel}
                  </Button>
                ) : (
                  <Button type="button" key="back" variant="secondary" onClick={prevStep}>
                    {previousStepLabel}
                  </Button>
                )}
                <Spacer />
                {isLastStep ? (
                  <Button key="submit" type="submit" isDisabled={formState.isSubmitting}>
                    {nextStepLabel}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNextClicked}>
                    {nextStepLabel}
                  </Button>
                )}
              </Flex>
            </Flex>
            <LoadingDialog
              isOpen={formState.isSubmitting || createDAO.isLoading}
              message={`Please confirm the "${name}" DAO creation transaction in your wallet to proceed.`}
            />
            <LoadingDialog
              isOpen={createDAO.isError}
              message={createDAO.error?.message ?? ""}
              icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
              buttonConfig={{
                text: "Dismiss",
                onClick: () => {
                  createDAO.reset();
                },
              }}
            />
          </form>
        }
      />
    </FormProvider>
  );
}
