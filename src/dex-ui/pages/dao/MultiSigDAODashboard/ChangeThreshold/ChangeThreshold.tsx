import { useParams } from "react-router-dom";
import { TransactionResponse } from "@hashgraph/sdk";
import { useCreateChangeThresholdProposal, useDAOs, useHandleTransactionSuccess } from "@hooks";
import { useForm } from "react-hook-form";
import { ChangeThresholdForm } from "./types";
import { Page } from "@layouts";
import { Color, LoadingDialog } from "@dex-ui-components";
import { Paths } from "@routes";
import { WarningIcon } from "@chakra-ui/icons";
import { MultiSigDAODetails } from "@services";
import { Wizard } from "@components";
import { DefaultMultiSigDAODetails } from "../types";

export function ChangeThreshold() {
  const { accountId: daoAccountId = "" } = useParams();
  const backTo = `${Paths.DAOs.absolute}/multisig/${daoAccountId}/settings`;
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const { ownerIds, safeId, accountId, threshold } = dao ?? DefaultMultiSigDAODetails;
  const membersCount = ownerIds.length;
  const handleTransactionSuccess = useHandleTransactionSuccess();

  const changeThresholdForm = useForm<ChangeThresholdForm>({
    defaultValues: {
      newThreshold: threshold,
    },
  });
  const {
    trigger,
    reset: resetForm,
    formState: { isSubmitting },
  } = changeThresholdForm;

  const sendChangeThresholdProposalMutationResults = useCreateChangeThresholdProposal(handleCreateProposalSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetSendProposeTransaction,
  } = sendChangeThresholdProposalMutationResults;

  const steps = [
    {
      label: "Details",
      route: `${Paths.DAOs.absolute}/multisig/${accountId}/settings/change-threshold/details`,
      validate: async () => trigger(["newThreshold"]),
    },
    {
      label: "Review",
      route: `${Paths.DAOs.absolute}/multisig/${accountId}/settings/change-threshold/review`,
      isError,
      isLoading,
    },
  ];

  function reset() {
    resetForm();
    resetSendProposeTransaction();
  }

  function handleCreateProposalSuccess(transactionResponse: TransactionResponse) {
    reset();
    const message = "Change Threshold proposal has been submitted.";
    handleTransactionSuccess(transactionResponse, message, backTo);
  }

  async function onSubmit(data: ChangeThresholdForm) {
    const { newThreshold } = data;
    return mutate({
      threshold: newThreshold,
      safeAccountId: safeId,
      multiSigDAOContractId: accountId,
    });
  }

  return (
    <>
      <Page
        body={
          <Wizard<ChangeThresholdForm>
            context={{
              title: "Change Threshold",
              backLabel: "Back to Settings",
              backTo,
              stepper: {
                steps,
              },
              form: {
                id: "multi-sig-change-threshold",
                context: { membersCount, threshold },
                ...changeThresholdForm,
              },
              onSubmit,
            }}
            header={<Wizard.Header />}
            stepper={<Wizard.Stepper />}
            form={<Wizard.Form />}
            footer={<Wizard.Footer />}
          />
        }
      />
      <LoadingDialog
        isOpen={isSubmitting || isLoading}
        message={"Please confirm the Propose Change Threshold transaction in your wallet to proceed."}
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
