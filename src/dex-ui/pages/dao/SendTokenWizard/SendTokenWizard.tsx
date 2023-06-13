import { useCreateMultiSigProposal, useDAOs, useHandleTransactionSuccess } from "@hooks";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { SendTokenForm } from "./types";
import { WarningIcon } from "@chakra-ui/icons";
import { Color, LoadingDialog } from "@dex-ui-components";
import { Paths } from "@routes";
import { ErrorLayout, LoadingSpinnerLayout, NotFound, Page } from "@layouts";
import { Wizard } from "@components";
import { TransactionResponse } from "@hashgraph/sdk";
import { MultiSigDAODetails } from "@services";
import { isNil, isNotNil } from "ramda";

export function SendTokenWizard() {
  const navigate = useNavigate();
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const { accountId: daoAccountId = "", tokenId = "" } = useParams();
  const backTo = `${Paths.DAOs.absolute}/multisig/${daoAccountId}/dashboard`;
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const isDAOFound = daosQueryResults.isSuccess && isNotNil(dao);

  const sendTokenMutationResults = useCreateMultiSigProposal(handleCreateDAOSuccess);
  const { isLoading, isError, error, mutate, reset: resetSendTokenTransaction } = sendTokenMutationResults;

  const sendTokenForm = useForm<SendTokenForm>({
    defaultValues: {
      recipientAccountId: "",
      tokenId: tokenId ?? "",
      amount: 0,
      decimals: 0,
    },
  });
  const {
    trigger,
    reset: resetForm,
    formState: { isSubmitting },
  } = sendTokenForm;

  const steps = [
    {
      label: "Details",
      route: `${Paths.DAOs.absolute}/multisig/${daoAccountId}/send-token/details`,
      validate: async () => trigger(["recipientAccountId", "tokenId", "amount"]),
    },
    { label: "Review", route: `${Paths.DAOs.absolute}/multisig/${daoAccountId}/send-token/review`, isError, isLoading },
  ];

  async function onSubmit(data: SendTokenForm) {
    const { recipientAccountId, tokenId, amount, decimals, title = "", description = "" } = data;
    mutate({
      tokenId,
      title,
      description,
      receiverId: recipientAccountId,
      amount: Number(amount),
      decimals,
      safeId: dao?.safeId ?? "",
      multiSigDAOContractId: daoAccountId,
    });
  }

  function reset() {
    resetForm();
    resetSendTokenTransaction();
  }

  function handleCreateDAOSuccess(transactionResponse: TransactionResponse) {
    reset();
    const message = `Created new multisig transaction.`;
    const pathTo = `${Paths.DAOs.absolute}/multisig/${daoAccountId}/dashboard`;
    handleTransactionSuccess(transactionResponse, message, pathTo);
  }

  function onBackToDAOLinkClick() {
    navigate(backTo);
  }

  if (daosQueryResults.isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (daosQueryResults.isError) {
    return <ErrorLayout message={error?.message} />;
  }

  if (isNotFound) {
    return (
      <NotFound
        message={`We didn't find any data for this DAO (${daoAccountId}).`}
        preLinkText={""}
        linkText={`Click here to return to the ${daoAccountId} dashboard page.`}
        onLinkClick={onBackToDAOLinkClick}
      />
    );
  }

  if (daosQueryResults.isSuccess && isDAOFound) {
    return (
      <>
        <Page
          body={
            <Wizard<SendTokenForm>
              context={{
                title: "Send Token",
                backLabel: "Back to DAOs",
                backTo,
                stepper: {
                  steps,
                },
                form: {
                  id: "multisig-send-token",
                  context: { safeAccountId: dao?.safeId ?? "" },
                  ...sendTokenForm,
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
          message={`Please confirm the send token transaction in your wallet to proceed.`}
        />
        <LoadingDialog
          isOpen={isError}
          message={error?.message ?? ""}
          icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
          buttonConfig={{
            text: "Dismiss",
            onClick: () => {
              resetSendTokenTransaction();
            },
          }}
        />
      </>
    );
  }

  return <></>;
}
