import { useParams } from "react-router-dom";
import { TransactionResponse } from "@hashgraph/sdk";
import { useForm } from "react-hook-form";
import { useDAOs, useCreateAddMemberProposal, useHandleTransactionSuccess } from "@hooks";
import { AddMemberForm } from "./types";
import { Page } from "@layouts";
import { Color, LoadingDialog } from "@dex-ui-components";
import { Paths } from "@routes";
import { WarningIcon } from "@chakra-ui/icons";
import { Wizard } from "@components";
import { MultiSigDAODetails } from "@services";
import { DefaultMultiSigDAODetails } from "../types";

export function AddMember() {
  const { accountId: daoAccountId = "" } = useParams();
  const backTo = `${Paths.DAOs.absolute}/multisig/${daoAccountId}/settings`;
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const { ownerIds, safeId, accountId, threshold } = dao ?? DefaultMultiSigDAODetails;
  const membersCount = ownerIds.length;
  const handleTransactionSuccess = useHandleTransactionSuccess();

  const addMemberForm = useForm<AddMemberForm>({
    defaultValues: {
      memberAddress: "",
      newThreshold: threshold,
    },
  });
  const {
    trigger,
    reset: resetForm,
    formState: { isSubmitting },
  } = addMemberForm;

  const sendAddMemberProposalMutationResults = useCreateAddMemberProposal(handleCreateProposalSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetSendProposeTransaction,
  } = sendAddMemberProposalMutationResults;

  const steps = [
    {
      label: "Details",
      route: `${Paths.DAOs.absolute}/multisig/${accountId}/settings/add-member/details`,
      validate: async () => trigger(["memberAddress", "newThreshold"]),
    },
    {
      label: "Review",
      route: `${Paths.DAOs.absolute}/multisig/${accountId}/settings/add-member/review`,
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
    const message = "Add Member proposal has been submitted.";
    handleTransactionSuccess(transactionResponse, message, backTo);
  }

  async function onSubmit(data: AddMemberForm) {
    const { newThreshold, memberAddress } = data as AddMemberForm;
    return mutate({
      newMemberAddress: memberAddress,
      safeAccountId: safeId,
      multiSigDAOContractId: accountId,
      threshold: newThreshold,
    });
  }

  return (
    <>
      <Page
        body={
          <Wizard<AddMemberForm>
            context={{
              title: "Add Member",
              backLabel: "Back to Settings",
              backTo,
              stepper: {
                steps,
              },
              form: {
                id: "multi-sig-add-member",
                context: { threshold: threshold, membersCount },
                ...addMemberForm,
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
        message={"Please confirm the Propose Add Member transaction in your wallet to proceed."}
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
