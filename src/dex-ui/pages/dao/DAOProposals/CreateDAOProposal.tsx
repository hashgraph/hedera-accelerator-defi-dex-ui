import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  CreateDAOMemberOperationForm,
  CreateDAOProposalForm,
  CreateDAOTokenTransferForm,
  CreateDAOUpgradeThresholdForm,
  DAOProposalType,
} from "./types";
import { ErrorLayout, LoadingSpinnerLayout, NotFound, Page } from "@layouts";
import { Paths } from "@routes";
import { useForm } from "react-hook-form";
import { Wizard } from "@components";
import { Color, LoadingDialog } from "@dex-ui-components";
import { WarningIcon } from "@chakra-ui/icons";
import { MultiSigDAODetails } from "@services";
import {
  useCreateAddMemberProposal,
  useCreateChangeThresholdProposal,
  useCreateDeleteMemberProposal,
  useCreateMultiSigProposal,
  useCreateReplaceMemberProposal,
  useDAOs,
  useDexContext,
  useHandleTransactionSuccess,
} from "@hooks";
import { isNil } from "ramda";
import { TransactionResponse } from "@hashgraph/sdk";

export function CreateDAOProposal() {
  const { accountId: daoAccountId = "" } = useParams();
  const createDaoProposalForm = useForm<CreateDAOProposalForm>({
    defaultValues: {
      type: DAOProposalType.Text,
      title: "",
      description: "",
      linkToDiscussion: "",
    },
  });
  const {
    trigger,
    getValues,
    watch,
    reset: resetForm,
    formState: { isSubmitting },
  } = createDaoProposalForm;
  watch("type");
  const location = useLocation();
  const navigate = useNavigate();
  const currentDaoType = location.pathname.split("/").at(2) ?? "";
  const backTo = `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/dashboard`;
  const daosQueryResults = useDAOs<MultiSigDAODetails>(daoAccountId);
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const { ownerIds, safeId: safeAccountId = "", threshold } = dao ?? {};
  const { type } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const transferFrom = currentDaoType === "multisig" ? safeAccountId : walletId;
  const sendTokenMutationResults = useCreateMultiSigProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateTokenTransferLoading,
    isError: isCreateTokenTransferFailed,
    error: createTokenTransferError,
    mutate: createTokenTransferProposal,
    reset: resetTransferTokenTransaction,
  } = sendTokenMutationResults;
  const sendAddMemberTransactionMutationResults = useCreateAddMemberProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isAddMemberLoading,
    isError: isAddMemberFailed,
    error: addMemberError,
    mutate: createAddMemberProposal,
    reset: resetSendAddMemberTransaction,
  } = sendAddMemberTransactionMutationResults;
  const sendDeleteMemberTransactionMutationResults = useCreateDeleteMemberProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isDeleteMemberLoading,
    isError: isDeleteMemberFailed,
    error: deleteMemberError,
    mutate: createDeleteMemberProposal,
    reset: resetDeleteMemberTransaction,
  } = sendDeleteMemberTransactionMutationResults;
  const sendReplaceMemberTransactionMutationResults = useCreateReplaceMemberProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isReplaceMemberLoading,
    isError: isReplaceMemberFailed,
    error: isReplaceMemberError,
    mutate: createReplaceMemberProposal,
    reset: resetReplaceMemberTransaction,
  } = sendReplaceMemberTransactionMutationResults;
  const sendChangeThresholdTransactionMutationResults =
    useCreateChangeThresholdProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isChangeThresholdLoading,
    isError: isChangeThresholdFailed,
    error: isChangeThresholdError,
    mutate: createChangeThresholdProposal,
    reset: resetChangeThresholdTransaction,
  } = sendChangeThresholdTransactionMutationResults;

  const isLoading =
    isCreateTokenTransferLoading ||
    isAddMemberLoading ||
    isDeleteMemberLoading ||
    isReplaceMemberLoading ||
    isChangeThresholdLoading;

  const isError =
    isCreateTokenTransferFailed ||
    isAddMemberFailed ||
    isDeleteMemberFailed ||
    isReplaceMemberFailed ||
    isChangeThresholdFailed;

  const steps = [
    {
      label: "Type",
      route: `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/type`,
      validate: async () => trigger(["type"]),
    },
    {
      label: "Details",
      route: ProposalsDetailsForm(),
      validate: async () => ValidateDetailsForm(),
    },
    {
      label: "Review",
      route: ProposalsReviewForm(),
      isLoading,
      isError,
    },
  ];

  function resetTransactions() {
    resetTransferTokenTransaction();
    resetSendAddMemberTransaction();
    resetDeleteMemberTransaction();
    resetReplaceMemberTransaction();
    resetChangeThresholdTransaction();
  }

  function reset() {
    resetForm();
    resetTransactions();
  }

  function GetFormErrorMessage(): string {
    if (createTokenTransferError) return createTokenTransferError.message;
    if (addMemberError) return addMemberError.message;
    if (deleteMemberError) return deleteMemberError.message;
    if (isReplaceMemberError) return isReplaceMemberError.message;
    if (isChangeThresholdError) return isChangeThresholdError.message;
    return "";
  }

  const errorMessage = GetFormErrorMessage();

  function handleCreateDAOProposalSuccess(transactionResponse: TransactionResponse) {
    reset();
    const message = `Created a new ${type} DAO proposal transaction.`;
    const pathTo = `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/dashboard`;
    handleTransactionSuccess(transactionResponse, message, pathTo);
  }

  function onBackToDAOLinkClick() {
    navigate(backTo);
  }

  async function onSubmit(data: CreateDAOProposalForm) {
    switch (type) {
      case DAOProposalType.TokenTransfer: {
        const { recipientAccountId, tokenId, amount, decimals } = data as CreateDAOTokenTransferForm;
        return createTokenTransferProposal({
          tokenId,
          receiverId: recipientAccountId,
          amount: Number(amount),
          decimals,
          safeId: dao?.safeId ?? "",
          multiSigDAOContractId: daoAccountId,
        });
      }
      case DAOProposalType.AddMember: {
        const { newThreshold, memberAddress } = data as CreateDAOMemberOperationForm;
        return createAddMemberProposal({
          safeAccountId,
          newMemberAddress: memberAddress,
          multiSigDAOContractId: daoAccountId,
          threshold: newThreshold,
        });
      }
      case DAOProposalType.RemoveMember: {
        const { newThreshold, memberAddress } = data as CreateDAOMemberOperationForm;
        return createDeleteMemberProposal({
          memberAddress,
          safeAccountId,
          multiSigDAOContractId: daoAccountId,
          threshold: newThreshold,
        });
      }
      case DAOProposalType.ReplaceMember: {
        const { memberAddress, newMemberAddress } = data as CreateDAOMemberOperationForm;
        return createReplaceMemberProposal({
          newMemberAddress: newMemberAddress,
          oldMemberAddress: memberAddress,
          safeAccountId,
          multiSigDAOContractId: daoAccountId,
        });
      }
      case DAOProposalType.UpgradeThreshold: {
        const { newThreshold } = data as CreateDAOUpgradeThresholdForm;
        return createChangeThresholdProposal({
          threshold: newThreshold,
          safeAccountId,
          multiSigDAOContractId: daoAccountId,
        });
      }
    }
  }

  function ProposalsDetailsForm(): string {
    switch (type) {
      case DAOProposalType.Text:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/text/details`;
      case DAOProposalType.TokenTransfer:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/token-transfer/details`;
      case DAOProposalType.AddMember:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/add-member/details`;
      case DAOProposalType.RemoveMember:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/remove-member/details`;
      case DAOProposalType.ReplaceMember:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/replace-member/details`;
      case DAOProposalType.UpgradeThreshold:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/upgrade-threshold/details`;
      default:
        return "";
    }
  }

  function ProposalsReviewForm(): string {
    switch (type) {
      case DAOProposalType.Text:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/text/review`;
      case DAOProposalType.TokenTransfer:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/token-transfer/review`;
      case DAOProposalType.AddMember:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/add-member/review`;
      case DAOProposalType.RemoveMember:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/remove-member/review`;
      case DAOProposalType.ReplaceMember:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/replace-member/review`;
      case DAOProposalType.UpgradeThreshold:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/upgrade-threshold/review`;
      default:
        return "";
    }
  }

  async function ValidateDetailsForm(): Promise<boolean> {
    if (type === DAOProposalType.Text) return trigger(["title", "description", "linkToDiscussion"]);
    if (type === DAOProposalType.AddMember) return trigger(["memberAddress", "newThreshold", "title", "description"]);
    if (type === DAOProposalType.RemoveMember)
      return trigger(["newThreshold", "memberAddress", "title", "description"]);
    if (type === DAOProposalType.ReplaceMember)
      return trigger(["memberAddress", "newMemberAddress", "title", "description"]);
    if (type === DAOProposalType.UpgradeThreshold) return trigger(["newThreshold", "title", "description"]);
    if (type === DAOProposalType.TokenTransfer) {
      return currentDaoType === "multisig"
        ? trigger(["title", "description", "recipientAccountId", "tokenId", "amount"])
        : trigger(["title", "description", "linkToDiscussion", "recipientAccountId", "tokenId", "amount"]);
    }
    return Promise.resolve(true);
  }

  if (daosQueryResults.isLoading) {
    return <LoadingSpinnerLayout />;
  }

  if (daosQueryResults.isError) {
    return <ErrorLayout message={errorMessage} />;
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

  return (
    <>
      <Page
        body={
          <Wizard<CreateDAOProposalForm>
            context={{
              title: "New Proposal",
              backLabel: "Back to dashboard",
              backTo,
              stepper: {
                steps,
              },
              form: {
                id: "create-dao-proposal",
                context: {
                  daoType: currentDaoType,
                  daoAccountId,
                  safeAccountId: transferFrom,
                  membersCount: ownerIds?.length ?? 0,
                  threshold,
                },
                ...createDaoProposalForm,
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
        message={`Please confirm the create proposal transaction in your wallet to proceed.`}
      />
      <LoadingDialog
        isOpen={isError}
        message={errorMessage}
        icon={<WarningIcon color={Color.Destructive._500} h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: () => {
            resetTransactions();
          },
        }}
      />
    </>
  );
}
