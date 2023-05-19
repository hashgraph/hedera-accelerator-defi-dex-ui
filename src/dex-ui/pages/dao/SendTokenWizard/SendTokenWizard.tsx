import { useCreateMultiSigTransaction, useDAOs } from "@hooks";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { SendTokenForm } from "./types";
import { WarningIcon } from "@chakra-ui/icons";
import { Color, LoadingDialog } from "@dex-ui-components";
import { Paths } from "@routes";
import { ErrorLayout, LoadingSpinnerLayout, NotFound, Page } from "@layouts";
import { Wizard } from "@components";
import { TransactionResponse } from "@hashgraph/sdk";
import { MultiSigDAODetails } from "@services";
import { isNil, isNotNil } from "ramda";
import { useSteps } from "chakra-ui-steps";
import { getLastPathInRoute } from "@utils";
import { getCurrentStepIndexByRoute } from "@components";

export function SendTokenWizard() {
  const navigate = useNavigate();
  const { accountId: daoAccountId = "", tokenId = "" } = useParams();
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const isDAOFound = daosQueryResults.isSuccess && isNotNil(dao);

  const sendTokenMutationResults = useCreateMultiSigTransaction(handleCreateDAOSuccess);
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
    { label: "Review", route: `${Paths.DAOs.absolute}/multisig/${daoAccountId}/send-token/review` },
  ];

  const location = useLocation();
  const lastPath = getLastPathInRoute(location.pathname);
  const intialStep = getCurrentStepIndexByRoute(steps, lastPath);
  const stepProps = useSteps({
    initialStep: intialStep > 0 ? intialStep : 0,
  });
  const { activeStep, nextStep, prevStep } = stepProps;

  async function onSubmit(data: SendTokenForm) {
    const { recipientAccountId, tokenId, amount, decimals } = data;
    mutate({
      tokenId,
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
    const createDAOSuccessMessage = `Created new multisig transaction`;
    navigate(`${Paths.DAOs.absolute}/multisig/${daoAccountId}/dashboard`, {
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

  function onBackToDAOLinkClick() {
    navigate(`${Paths.DAOs.absolute}/multisig/${daoAccountId}/dashboard`);
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
                backTo: `${Paths.DAOs.absolute}/multisig/${daoAccountId}/dashboard`,
                stepper: {
                  activeStep,
                  steps,
                  nextStep,
                  prevStep,
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
