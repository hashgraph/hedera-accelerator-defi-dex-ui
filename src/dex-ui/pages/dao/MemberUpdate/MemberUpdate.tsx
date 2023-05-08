import { useLocation, useNavigate } from "react-router-dom";
import { TransactionResponse } from "@hashgraph/sdk";
import { Button, Flex, Spacer, Text } from "@chakra-ui/react";
import { useSteps } from "chakra-ui-steps";
import { useSendProposeTransaction } from "@hooks";
import { FormProvider, useForm } from "react-hook-form";
import {
  MemberUpdateForm,
  MemberOperationsType,
  AddMemberForm,
  DeleteMemberForm,
  ReplaceMemberForm,
  ChangeThresholdForm,
} from "./types";
import { Page } from "@dex-ui/layouts";
import { Color, LoadingDialog, StepperV2 } from "@dex-ui-components";
import { AddNewMemberDetailsForm } from "./AddNewMemberDetailsForm";
import { AddNewMemberReviewForm } from "./AddNewMemberReviewForm";
import { Paths } from "@dex-ui/routes";
import { Member } from "../DAODetailsPage/MultiSigDAODashboard";
import { WarningIcon } from "@chakra-ui/icons";
import { DeleteMemberDetailsForm } from "./DeleteMemberDetailsForm";
import { DeleteMemberReviewForm } from "./DeleteMemberReviewForm";
import { ReplaceMemberDetailsForm } from "./ReplaceMemberDetailsForm";
import { ReplaceMemberReviewForm } from "./ReplaceMemberReviewForm";
import { ChangeThresholdDetailsForm } from "./ChangeThresholdDetailsForm";
import { ChangeThresholdReviewForm } from "./ChangeThresholdReviewForm";

interface MemberUpdateType {
  operationType: string;
}

export function MemberUpdate(props: MemberUpdateType) {
  const location = useLocation();
  const navigate = useNavigate();
  const { operationType } = props;
  const { accountId, adminId, safeId, ownerIds, threshold } = location.state;
  const members: Member[] = [adminId, ...ownerIds].map((ownerId: string) => ({
    name: "-",
    logo: "",
    accountId: ownerId,
  }));
  const stepProps = useSteps({
    initialStep: 0,
  });

  const memberUpdateForm = useForm<MemberUpdateForm>({
    defaultValues: {
      memberAddress: "",
      newThreshold: threshold,
    },
  });
  const {
    trigger,
    handleSubmit,
    formState: { isSubmitting },
  } = memberUpdateForm;

  const sendProposeTransactionMutationResults = useSendProposeTransaction(handleSendProposesSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetSendProposeTransaction,
  } = sendProposeTransactionMutationResults;

  function DetailsForm() {
    if (operationType === MemberOperationsType.AddMember)
      return <AddNewMemberDetailsForm members={members} threshold={threshold} />;
    if (operationType === MemberOperationsType.DeleteMember)
      return <DeleteMemberDetailsForm members={members} threshold={threshold} memberId={location.state.memberId} />;
    if (operationType === MemberOperationsType.ReplaceMember)
      return <ReplaceMemberDetailsForm memberId={location.state.memberId} />;
    if (operationType === MemberOperationsType.ChangeThreshold)
      return <ChangeThresholdDetailsForm members={members} threshold={threshold} />;
    return <></>;
  }

  function ReviewForm() {
    if (operationType === MemberOperationsType.AddMember)
      return <AddNewMemberReviewForm members={members} threshold={threshold} />;
    if (operationType === MemberOperationsType.DeleteMember)
      return <DeleteMemberReviewForm members={members} threshold={threshold} memberId={location.state.memberId} />;
    if (operationType === MemberOperationsType.ReplaceMember)
      return <ReplaceMemberReviewForm memberId={location.state.memberId} />;
    if (operationType === MemberOperationsType.ChangeThreshold) return <ChangeThresholdReviewForm members={members} />;
    return <></>;
  }

  const steps = [
    {
      label: "Details",
      content: DetailsForm(),
    },
    {
      label: "Review",
      content: ReviewForm(),
      isLoading: isLoading,
      isError: isError,
    },
  ];

  function handleSendProposesSuccess(transactionResponse: TransactionResponse) {
    reset();
    const createSuccessMessage = "Proposal has been submitted.";
    navigate(`${Paths.DAOs.DAODetails}/${accountId}`, {
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

  const { nextStep, prevStep, reset, activeStep } = stepProps;
  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;
  const previousStepLabel = isFirstStep ? "Cancel" : `< Back`;
  const nextStepLabel = isLastStep ? "Submit" : "Next >";

  function handleCancelClicked() {
    reset();
    navigate(Paths.DAOs.default);
  }

  async function validateStep(activeStep: number): Promise<boolean> {
    const triggerDefaultValidations = (): Promise<boolean> => Promise.resolve(true);
    switch (activeStep) {
      case 0: {
        if (operationType === MemberOperationsType.AddMember) return trigger(["memberAddress", "newThreshold"]);
        if (operationType === MemberOperationsType.DeleteMember) return trigger(["newThreshold"]);
        if (operationType === MemberOperationsType.ReplaceMember) return trigger(["memberAddress"]);
        if (operationType === MemberOperationsType.ChangeThreshold) return trigger(["newThreshold"]);
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

  async function onSubmit(data: MemberUpdateForm) {
    if (operationType === MemberOperationsType.AddMember) {
      const { newThreshold, memberAddress } = data as AddMemberForm;
      return mutate({
        newMemberAddress: memberAddress,
        safeAccountId: safeId,
        multiSigDAOContractId: accountId,
        threshold: newThreshold,
        type: operationType,
      });
    }
    if (operationType === MemberOperationsType.DeleteMember) {
      const { newThreshold } = data as DeleteMemberForm;
      return mutate({
        memberAddress: location.state.memberId,
        safeAccountId: safeId,
        multiSigDAOContractId: accountId,
        threshold: newThreshold,
        type: operationType,
      });
    }
    if (operationType === MemberOperationsType.ReplaceMember) {
      const { memberAddress } = data as ReplaceMemberForm;
      return mutate({
        newMemberAddress: memberAddress,
        oldMemberAddress: location.state.memberId,
        safeAccountId: safeId,
        multiSigDAOContractId: accountId,
        type: operationType,
      });
    }
    if (operationType === MemberOperationsType.ChangeThreshold) {
      const { newThreshold } = data as ChangeThresholdForm;
      return mutate({
        threshold: newThreshold,
        safeAccountId: safeId,
        multiSigDAOContractId: accountId,
        type: operationType,
      });
    }
  }

  function getLoadingMessage(): string {
    if (operationType === MemberOperationsType.AddMember)
      return "Please confirm the Add Member transaction in your wallet to proceed.";
    if (operationType === MemberOperationsType.DeleteMember)
      return "Please confirm the Remove Member transaction in your wallet to proceed.";
    if (operationType === MemberOperationsType.ReplaceMember)
      return "Please confirm the Replace Member transaction in your wallet to proceed.";
    if (operationType === MemberOperationsType.ChangeThreshold)
      return "Please confirm the Change Threshold transaction in your wallet to proceed.";
    return "";
  }

  const loadingDialogMessage = getLoadingMessage();

  function getHeaderTitle(): string {
    if (operationType === MemberOperationsType.AddMember) return "Add Member Proposal";
    if (operationType === MemberOperationsType.DeleteMember) return "Remove Member Proposal";
    if (operationType === MemberOperationsType.ReplaceMember) return "Replace Member Proposal";
    if (operationType === MemberOperationsType.ChangeThreshold) return "Change Threshold Proposal";
    return "";
  }

  const headerTitle = getHeaderTitle();

  return (
    <>
      <FormProvider {...memberUpdateForm}>
        <Page
          body={
            <form onSubmit={handleSubmit(onSubmit)}>
              <Flex direction="column" alignItems="center" maxWidth="624px" margin="auto" gap="8" paddingTop="2rem">
                <Text textStyle="h4 medium">{headerTitle}</Text>
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
      <LoadingDialog isOpen={isSubmitting || isLoading} message={loadingDialogMessage} />
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
