import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { useSteps } from "chakra-ui-steps";
import { Color, LoadingDialog, StepperV2, useNotification } from "../../../dex-ui-components";
import { Page } from "../../layouts";
import { DAODetailsForm, DAOGovernanceForm, DAOTypeForm, DAOVotingForm, ReviewNewDAO } from "./forms";
import { useNavigate } from "react-router-dom";
import { DAOType } from "./types";
import { useCreateToken, useCreateDAO } from "../../hooks";
import { WarningIcon } from "@chakra-ui/icons";
import { TransactionResponse } from "@hashgraph/sdk";

export type CreateADAOData = {
  name: string;
  description: string;
  logoUrl?: string;
  isPublic?: boolean;
  type: DAOType;
  token: {
    name: string;
    symbol: string;
    decimals: number;
    logo: string;
    initialSupply: number;
    id: string;
    treasuryWalletAccountId: string;
  };
  voting: {
    minProposalDeposit: number;
    quorum: number;
    duration: number;
    lockingPeriod: number;
    strategy: string;
  };
};

export function CreateADAOPage() {
  const stepProps = useSteps({
    initialStep: 0,
  });
  const navigate = useNavigate();
  const createDAOPageForm = useForm<CreateADAOData>({
    defaultValues: {
      type: DAOType.GovernanceToken,
    },
  });
  /**
   * TODO: Remove these watchers. The create token data should be managed in a seperate useForm state.
   * This is a workaround to rerender the form data before the create token button is clicked.
   */
  createDAOPageForm.watch([
    "token.name",
    "token.symbol",
    "token.decimals",
    "token.initialSupply",
    "token.treasuryWalletAccountId",
  ]);
  const formValues = createDAOPageForm.getValues();

  function handleCreateDAOSuccess(transactionResponse: TransactionResponse) {
    const createDAOSuccessMessage = `Created new 
    ${formValues.isPublic ? "public" : "private"} DAO 
    "${formValues.name}" with a treasury wallet account id of 
    ${formValues.token.treasuryWalletAccountId}`;
    navigate("/DAOs", {
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

  const createToken = useCreateToken(handleCreateTokenSuccessful);
  const createTokenNotification = useNotification({
    successMessage: `${formValues.token?.symbol} token was successfully created`,
    transactionState: {
      transactionWaitingToBeSigned: false,
      successPayload: createToken.data ?? null,
      errorMessage: createToken.error?.message ?? "",
    },
  });

  function handleCreateTokenSuccessful() {
    createTokenNotification.setIsNotificationVisible(true);
  }

  const createDAO = useCreateDAO(handleCreateDAOSuccess);

  async function createNewToken() {
    const isCreateTokenDataValid = await createDAOPageForm.trigger([
      "token.name",
      "token.symbol",
      "token.decimals",
      "token.initialSupply",
      "token.treasuryWalletAccountId",
    ]);
    if (isCreateTokenDataValid) {
      createToken.mutate({
        name: formValues.token.name,
        symbol: formValues.token.symbol,
        initialSupply: formValues.token.initialSupply,
        decimals: formValues.token.decimals,
        treasuryAccountId: formValues.token.treasuryWalletAccountId,
      });
      createTokenNotification.setIsNotificationVisible(true);
    }
  }

  const steps = [
    {
      label: "Details",
      content: (
        <DAODetailsForm
          register={createDAOPageForm.register}
          errors={createDAOPageForm.formState.errors}
          control={createDAOPageForm.control}
        />
      ),
    },
    { label: "Type", content: <DAOTypeForm setValue={createDAOPageForm.setValue} /> },
    {
      label: "Governance",
      content: (
        <DAOGovernanceForm
          notification={createTokenNotification}
          register={createDAOPageForm.register}
          errors={createDAOPageForm.formState.errors}
          createNewToken={createNewToken}
        />
      ),
      isLoading: createToken.isLoading,
      isError: createToken.isError,
    },
    {
      label: "Voting",
      content: <DAOVotingForm register={createDAOPageForm.register} errors={createDAOPageForm.formState.errors} />,
    },
    {
      label: "Review",
      content: <ReviewNewDAO formValues={formValues} />,
      isLoading: createDAO.isLoading,
      isError: createDAO.isError,
    },
  ];

  const { nextStep, prevStep, reset, activeStep } = stepProps;
  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  function handleCancelClicked() {
    reset();
    navigate("/DAOs");
  }

  async function validateStep(activeStep: number): Promise<boolean> {
    const isValid = true;
    if (activeStep === 0) return createDAOPageForm.trigger(["name", "logoUrl", "isPublic"]);
    if (activeStep === 1) return isValid;
    if (activeStep === 2) return createDAOPageForm.trigger(["token.id", "token.treasuryWalletAccountId"]);
    if (activeStep === 3)
      return createDAOPageForm.trigger(["voting.quorum", "voting.duration", "voting.lockingPeriod"]);
    if (activeStep === 4) return isValid;
    return isValid;
  }

  async function handleNextClicked() {
    const isStepDataValid = await validateStep(activeStep);
    if (isStepDataValid) nextStep();
  }

  async function onSubmit(data: CreateADAOData) {
    createDAO.mutate({
      name: data.name,
      logoUrl: data.logoUrl ?? "",
      isPrivate: !data.isPublic,
      tokenId: data.token.id,
      treasuryWalletAccountId: data.token.treasuryWalletAccountId,
      quorum: data.voting.quorum,
      votingDuration: data.voting.duration,
      lockingDuration: data.voting.lockingPeriod,
    });
  }

  return (
    <Page
      body={
        <form onSubmit={createDAOPageForm.handleSubmit(onSubmit)}>
          <Flex direction="column" alignItems="center" maxWidth="624px" margin="auto" gap="8">
            <Text textStyle="h4 medium">Create a DAO</Text>
            <StepperV2 steps={steps} {...stepProps} />
            <Flex width="100%">
              {isFirstStep ? (
                <Button key="cancel" variant="secondary" onClick={handleCancelClicked}>
                  Cancel
                </Button>
              ) : (
                <Button type="button" key="back" variant="secondary" onClick={prevStep}>
                  {"< Back"}
                </Button>
              )}
              <Spacer />
              {isLastStep ? (
                <Button key="submit" type="submit" isDisabled={createDAOPageForm.formState.isSubmitting}>
                  Create DAO
                </Button>
              ) : (
                <Button type="button" onClick={handleNextClicked}>
                  {"Next >"}
                </Button>
              )}
            </Flex>
          </Flex>
          <LoadingDialog
            isOpen={createDAOPageForm.formState.isSubmitting || createDAO.isLoading || createToken.isLoading}
            message={
              createDAO.isLoading
                ? `Please confirm the "${formValues.name}" DAO creation transaction in your wallet to proceed.`
                : createToken.isLoading
                ? `Please confirm the create ${formValues.token.name} token transaction in your wallet to proceed.`
                : ""
            }
          />
          <LoadingDialog
            isOpen={createDAO.isError || createToken.isError}
            message={
              createDAO.isError ? createDAO.error?.message : createToken.isError ? createToken.error.message : ""
            }
            icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
            buttonConfig={{
              text: "Dismiss",
              onClick: () => {
                createDAO.reset();
                createToken.reset();
              },
            }}
          />
        </form>
      }
    />
  );
}
