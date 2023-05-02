import { TransactionResponse } from "@hashgraph/sdk";
import { WarningIcon } from "@chakra-ui/icons";
import { ProgressBar, useProgessBar, Button, AlertDialog, Color, LoadingDialog } from "@dex-ui-components";
import { useCreateMultiSigTransaction } from "@hooks";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Text, Flex, Spacer, Progress } from "@chakra-ui/react";
import { MultiSigTransactionDetailsForm } from "./MultiSigTransactionDetailsForm";
import { MultiSigTransactionReviewForm } from "./MultiSigTransactionReviewForm";
import { CreateMultiSigTransactionForm } from "./types";
import { Paths } from "@routes";
import { useNavigate } from "react-router-dom";

interface MultiSigTransactionModalProps {
  daoAccountId: string;
  safeAccountId: string;
  openDialogButtonText: string;
  tokenId?: string;
}

export function MultiSigTransactionModal(props: MultiSigTransactionModalProps) {
  const [dialogsOpenState, setDialogsOpenState] = useState(false);
  const navigate = useNavigate();
  const { tokenId, openDialogButtonText, daoAccountId, safeAccountId } = props;
  const createMultiSigTransactionMutationResults = useCreateMultiSigTransaction(handleCreateDAOSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetCreateMultiSigTransaction,
  } = createMultiSigTransactionMutationResults;
  const createMultiSigTransactionForm = useForm<CreateMultiSigTransactionForm>({
    defaultValues: {
      recipientAccountId: "",
      tokenId: tokenId ?? "",
      amount: 0,
      decimals: 0,
    },
  });
  const {
    trigger,
    handleSubmit,
    reset: resetForm,
    formState: { isSubmitting },
  } = createMultiSigTransactionForm;

  const steps = [
    <MultiSigTransactionDetailsForm safeAccountId={safeAccountId} />,
    <MultiSigTransactionReviewForm safeAccountId={safeAccountId} />,
  ];

  async function validateStep(activeStep: number): Promise<boolean> {
    const triggerDefaultValidations = (): Promise<boolean> => Promise.resolve(true);
    switch (activeStep) {
      case 0: {
        return trigger(["recipientAccountId", "tokenId", "amount"]);
      }
      default: {
        return triggerDefaultValidations();
      }
    }
  }

  const {
    reset: resetProgressBar,
    nextStep,
    prevStep,
    activeStep,
    progressBarValue,
    progressBarCaption,
    isLastStep,
    isFirstStep,
    previousStepLabel,
    nextStepLabel,
  } = useProgessBar(steps);

  async function onSubmit(data: CreateMultiSigTransactionForm) {
    const { recipientAccountId, tokenId, amount, decimals } = data;
    mutate({
      tokenId,
      receiverId: recipientAccountId,
      amount: Number(amount),
      decimals,
      multiSigDAOContractId: daoAccountId,
    });
  }

  function reset() {
    resetProgressBar();
    resetForm();
    resetCreateMultiSigTransaction();
  }

  async function handleNextClicked() {
    const isStepDataValid = await validateStep(activeStep);
    if (isStepDataValid) nextStep();
  }

  function handleCancelClicked() {
    reset();
    setDialogsOpenState(false);
  }

  function handlePreviousClicked() {
    prevStep();
  }

  function handleCreateDAOSuccess(transactionResponse: TransactionResponse) {
    reset();
    setDialogsOpenState(false);
    const createDAOSuccessMessage = `Created new multisig transaction`;
    navigate(`${Paths.DAOs.DAODetails}/${daoAccountId}`, {
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

  return (
    <>
      <FormProvider {...createMultiSigTransactionForm}>
        <form id="multisig-send-token" onSubmit={handleSubmit(onSubmit)}>
          <Progress value={100} size="xl" colorScheme="pink" />
          <AlertDialog
            title="Send Token"
            size="xl"
            dialogWidth="623px"
            openDialogButtonText={openDialogButtonText}
            body={
              <Flex direction="column" alignItems="center" maxWidth="624px" gap="8" padding="0.75rem 0">
                <Flex direction="column" width="100%" gap="2">
                  <ProgressBar
                    value={progressBarValue}
                    bg={Color.Neutral._200}
                    borderRadius="8px"
                    progressBarColor={`${Color.Primary._500}`}
                  />
                  <Text textStyle="p xsmall regular">{progressBarCaption}</Text>
                </Flex>
                {steps.at(activeStep)}
              </Flex>
            }
            footer={
              <Flex width="100%">
                {isFirstStep ? (
                  <Button key="cancel" variant="secondary" onClick={handleCancelClicked}>
                    {previousStepLabel}
                  </Button>
                ) : (
                  <Button type="button" key="back" variant="secondary" onClick={handlePreviousClicked}>
                    {previousStepLabel}
                  </Button>
                )}
                <Spacer />
                {isLastStep ? (
                  <Button key="submit" type="submit" form="multisig-send-token" isDisabled={isSubmitting}>
                    {nextStepLabel}
                  </Button>
                ) : (
                  <Button type="button" onClick={handleNextClicked}>
                    {nextStepLabel}
                  </Button>
                )}
              </Flex>
            }
            alertDialogOpen={dialogsOpenState}
            onAlertDialogOpen={() => {
              setDialogsOpenState(true);
            }}
            onAlertDialogClose={() => {
              setDialogsOpenState(false);
              reset();
            }}
          />
        </form>
      </FormProvider>
      <LoadingDialog
        isOpen={isSubmitting || isLoading}
        message={`Please confirm the multisig transaction in your wallet to proceed.`}
      />
      <LoadingDialog
        isOpen={isError}
        message={error?.message ?? ""}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            resetCreateMultiSigTransaction();
          },
        }}
      />
    </>
  );
}
