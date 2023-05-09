import { useLocation, useNavigate, useParams } from "react-router-dom";
import { TransactionResponse } from "@hashgraph/sdk";
import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { useSteps } from "chakra-ui-steps";
import { useCreateDeleteMemberTransaction } from "@hooks";
import { FormProvider, useForm } from "react-hook-form";
import { DeleteMemberForm } from "./types";
import { Page } from "@dex-ui/layouts";
import { Color, LoadingDialog, StepperV2 } from "@dex-ui-components";
import { DeleteMemberDetailsForm } from "./DeleteMemberDetailsForm";
import { DeleteMemberReviewForm } from "./DeleteMemberReviewForm";
import { Paths } from "@dex-ui/routes";
import { Member } from "../types";
import { WarningIcon } from "@chakra-ui/icons";

export function DeleteMember() {
  const location = useLocation();
  const navigate = useNavigate();
  const { memberId } = useParams();
  const { accountId, adminId, safeId, ownerIds, threshold } = location.state;
  const members: Member[] = [adminId, ...ownerIds].map((ownerId: string) => ({
    name: "-",
    logo: "",
    accountId: ownerId,
  }));
  const stepProps = useSteps({
    initialStep: 0,
  });

  const deleteMemberForm = useForm<DeleteMemberForm>({
    defaultValues: {
      newThreshold: threshold,
    },
  });
  const {
    trigger,
    handleSubmit,
    formState: { isSubmitting },
  } = deleteMemberForm;

  const sendDeleteMemberTransactionMutationResults = useCreateDeleteMemberTransaction(handleSendProposesSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetSendProposeTransaction,
  } = sendDeleteMemberTransactionMutationResults;

  const steps = [
    {
      label: "Details",
      content: <DeleteMemberDetailsForm members={members} threshold={threshold} memberId={memberId ?? ""} />,
    },
    {
      label: "Review",
      content: <DeleteMemberReviewForm members={members} threshold={threshold} memberId={memberId ?? ""} />,
      isLoading: isLoading,
      isError: isError,
    },
  ];

  const { nextStep, prevStep, reset, activeStep } = stepProps;
  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;
  const previousStepLabel = isFirstStep ? "Cancel" : `< Back`;
  const nextStepLabel = isLastStep ? "Submit" : "Next >";

  function handleSendProposesSuccess(transactionResponse: TransactionResponse) {
    reset();
    const createSuccessMessage = "Proposal has been submitted.";
    navigate(`${Paths.DAOs.absolute}/multisig/${accountId}/dashboard`, {
      state: {
        createSuccessMessage,
        transactionState: {
          transactionWaitingToBeSigned: false,
          successPayload: transactionResponse,
          errorMessage: "",
        },
      },
    });
  }

  async function validateStep(activeStep: number): Promise<boolean> {
    const triggerDefaultValidations = (): Promise<boolean> => Promise.resolve(true);
    switch (activeStep) {
      case 0: {
        return trigger(["newThreshold"]);
      }
      default: {
        return triggerDefaultValidations();
      }
    }
  }

  function handleCancelClicked() {
    reset();
    navigate(`${Paths.DAOs.absolute}/multisig/${accountId}/settings`);
  }

  async function handleNextClicked() {
    const isStepDataValid = await validateStep(activeStep);
    if (isStepDataValid) nextStep();
  }

  async function onSubmit(data: DeleteMemberForm) {
    const { newThreshold } = data;
    return mutate({
      memberAddress: memberId ?? "",
      safeAccountId: safeId,
      multiSigDAOContractId: accountId,
      threshold: newThreshold,
    });
  }

  return (
    <>
      <FormProvider {...deleteMemberForm}>
        <Page
          body={
            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex direction="column" alignItems="center" maxWidth="624px" margin="auto" gap="8" paddingTop="2rem">
                <Text textStyle="h4 medium">Delete Member Proposal</Text>
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
                    <Button key="submit" type="submit" isDisabled={isSubmitting}>
                      {nextStepLabel}
                    </Button>
                  ) : (
                    <Button type="button" onClick={handleNextClicked}>
                      {nextStepLabel}
                    </Button>
                  )}
                </Flex>
              </Flex>
            </form>
          }
        />
      </FormProvider>
      <LoadingDialog
        isOpen={isSubmitting || isLoading}
        message={"Please confirm the Delete Member transaction in your wallet to proceed."}
      />
      <LoadingDialog
        isOpen={isError}
        message={error?.message ?? ""}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            resetSendProposeTransaction();
          },
        }}
      />
    </>
  );
}
