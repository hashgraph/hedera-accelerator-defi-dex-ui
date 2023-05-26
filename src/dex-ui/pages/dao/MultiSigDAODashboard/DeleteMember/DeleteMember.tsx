import { useParams } from "react-router-dom";
import { TransactionResponse } from "@hashgraph/sdk";
import { useCreateDeleteMemberTransaction, useDAOs, useHandleTransactionSuccess } from "@hooks";
import { useForm } from "react-hook-form";
import { DeleteMemberForm } from "./types";
import { Page } from "@layouts";
import { Color, LoadingDialog } from "@dex-ui-components";
import { Paths } from "@routes";
import { WarningIcon } from "@chakra-ui/icons";
import { MultiSigDAODetails } from "@services";
import { Wizard } from "@components";
import { DefaultMultiSigDAODetails } from "../types";

export function DeleteMember() {
  const { accountId: daoAccountId = "", memberId = "" } = useParams();
  const backTo = `${Paths.DAOs.absolute}/multisig/${daoAccountId}/settings`;
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const { ownerIds, safeId, accountId, threshold } = dao ?? DefaultMultiSigDAODetails;
  const membersCount = ownerIds.length;
  const handleTransactionSuccess = useHandleTransactionSuccess();

  const deleteMemberForm = useForm<DeleteMemberForm>({
    defaultValues: {
      newThreshold: threshold,
    },
  });
  const {
    trigger,
    reset: resetForm,
    formState: { isSubmitting },
  } = deleteMemberForm;

  const sendDeleteMemberTransactionMutationResults = useCreateDeleteMemberTransaction(handleCreateProposalSuccess);
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
      route: `${Paths.DAOs.absolute}/multisig/${accountId}/settings/delete-member/${memberId}/details`,
      validate: async () => trigger(["newThreshold"]),
    },
    {
      label: "Review",
      route: `${Paths.DAOs.absolute}/multisig/${accountId}/settings/delete-member/${memberId}/review`,
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
    const message = "Delete Member proposal has been submitted.";
    handleTransactionSuccess(transactionResponse, message, backTo);
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
      <Page
        body={
          <Wizard<DeleteMemberForm>
            context={{
              title: "Delete Member",
              backLabel: "Back to Settings",
              backTo,
              stepper: {
                steps,
              },
              form: {
                id: "multi-sig-delete-member",
                context: { threshold, memberId, membersCount },
                ...deleteMemberForm,
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
