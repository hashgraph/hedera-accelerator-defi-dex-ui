import { useNavigate, useParams } from "react-router-dom";
import { TransactionResponse } from "@hashgraph/sdk";
import { useCreateReplaceMemberTransaction, useDAOs } from "@hooks";
import { useForm } from "react-hook-form";
import { ReplaceMemberForm } from "./types";
import { Page } from "@layouts";
import { Color, LoadingDialog } from "@dex-ui-components";
import { Paths } from "@routes";
import { WarningIcon } from "@chakra-ui/icons";
import { Wizard } from "@components";
import { MultiSigDAODetails } from "@services";
import { DefaultMultiSigDAODetails } from "../types";

export function ReplaceMember() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "", memberId = "" } = useParams();
  const backTo = `${Paths.DAOs.absolute}/multisig/${daoAccountId}/settings`;
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const { safeId, accountId } = dao ?? DefaultMultiSigDAODetails;

  const replaceMemberForm = useForm<ReplaceMemberForm>({
    defaultValues: {
      memberAddress: "",
    },
  });

  const {
    trigger,
    reset: resetForm,
    formState: { isSubmitting },
  } = replaceMemberForm;

  const sendReplaceMemberTransactionMutationResults = useCreateReplaceMemberTransaction(handleSendProposesSuccess);
  const {
    isLoading,
    isError,
    error,
    mutate,
    reset: resetSendProposeTransaction,
  } = sendReplaceMemberTransactionMutationResults;

  const steps = [
    {
      label: "Details",
      route: `${Paths.DAOs.absolute}/multisig/${accountId}/settings/replace-member/${memberId}/details`,
      validate: async () => trigger(["memberAddress"]),
    },
    {
      label: "Review",
      route: `${Paths.DAOs.absolute}/multisig/${accountId}/settings/replace-member/${memberId}/review`,
      isError,
      isLoading,
    },
  ];

  function reset() {
    resetForm();
    resetSendProposeTransaction();
  }

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

  async function onSubmit(data: ReplaceMemberForm) {
    const { memberAddress } = data;
    return mutate({
      newMemberAddress: memberAddress,
      oldMemberAddress: memberId ?? "",
      safeAccountId: safeId,
      multiSigDAOContractId: accountId,
    });
  }

  return (
    <>
      <Page
        body={
          <Wizard<ReplaceMemberForm>
            context={{
              title: "Replace Member",
              backLabel: "Back to Settings",
              backTo,
              stepper: {
                steps,
              },
              form: {
                id: "multi-sig-replace-member",
                context: { memberId },
                ...replaceMemberForm,
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
        message={"Please confirm the Replace Member transaction in your wallet to proceed."}
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
