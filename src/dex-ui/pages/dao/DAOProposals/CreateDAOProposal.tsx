import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  CreateDAOContractUpgradeForm,
  CreateDAOMemberOperationForm,
  CreateDAOProposalForm,
  CreateDAOTextProposalForm,
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
import {
  DAOType,
  DEFAULT_NFT_TOKEN_SERIAL_ID,
  GovernanceDAODetails,
  MultiSigDAODetails,
  NFTDAODetails,
} from "@services";
import {
  useCreateAddMemberProposal,
  useCreateChangeThresholdProposal,
  useCreateDAOTextProposal,
  useCreateDAOTokenTransferProposal,
  useCreateDAOUpgradeProposal,
  useCreateDeleteMemberProposal,
  useCreateMultiSigProposal,
  useCreateReplaceMemberProposal,
  useDAOs,
  useDexContext,
  useHandleTransactionSuccess,
} from "@hooks";
import { isNil } from "ramda";
import { TransactionResponse } from "@hashgraph/sdk";
import { getLastPathInRoute } from "@utils";
import { getPreviousMemberAddress } from "../utils";

export function CreateDAOProposal() {
  const { accountId: daoAccountId = "" } = useParams();
  const createDaoProposalForm = useForm<CreateDAOProposalForm>({
    defaultValues: {
      type: DAOProposalType.TokenTransfer,
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
  const currentWizardStep = getLastPathInRoute(location.pathname);
  const backTo = `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/${Paths.DAOs.Overview}`;
  const daosQueryResults = useDAOs(daoAccountId);
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const { ownerIds, safeId: safeAccountId = "", threshold } = (dao as MultiSigDAODetails) ?? {};
  const { governors, tokenId: governanceTokenId = "" } = (dao as GovernanceDAODetails | NFTDAODetails) ?? {};
  const { type } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const transferFrom = currentDaoType === "multisig" ? safeAccountId : walletId;
  const wizardTitle = currentWizardStep === "type" ? "New Proposal" : type;

  const sendMultisigTokenMutationResults = useCreateMultiSigProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateMultisigTokenTransferLoading,
    isError: isCreateMultisigTokenTransferFailed,
    error: createMultisigTokenTransferError,
    mutate: createMultisigTokenTransferProposal,
    reset: resetMultisigTransferTokenTransaction,
  } = sendMultisigTokenMutationResults;

  const sendGOVTokenMutationResults = useCreateDAOTokenTransferProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateGOVTokenTransferLoading,
    isError: isCreateGOVTokenTransferFailed,
    error: createGOVTokenTransferError,
    mutate: createGOVTokenTransferProposal,
    reset: resetGOVTransferTokenTransaction,
  } = sendGOVTokenMutationResults;
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

  const sendDAOUpgradeMutationResults = useCreateDAOUpgradeProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateDAOUpgradeLoading,
    isError: isCreateDAOUpgradeFailed,
    error: isCreateDAOUpgradeError,
    mutate: createDAOUpgradeProposal,
    reset: resetCreateDAOUpgradeProposal,
  } = sendDAOUpgradeMutationResults;

  const sendDAOTextMutationResults = useCreateDAOTextProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateDAOTextProposalLoading,
    isError: isCreateDAOTextProposalFailed,
    error: isCreateDAOTextProposalError,
    mutate: createDAOTextProposal,
    reset: resetCreateDAOTextProposal,
  } = sendDAOTextMutationResults;

  const isLoading =
    isCreateMultisigTokenTransferLoading ||
    isCreateGOVTokenTransferLoading ||
    isAddMemberLoading ||
    isDeleteMemberLoading ||
    isReplaceMemberLoading ||
    isCreateDAOUpgradeLoading ||
    isCreateDAOTextProposalLoading ||
    isChangeThresholdLoading;

  const isError =
    isCreateMultisigTokenTransferFailed ||
    isCreateGOVTokenTransferFailed ||
    isAddMemberFailed ||
    isDeleteMemberFailed ||
    isReplaceMemberFailed ||
    isCreateDAOUpgradeFailed ||
    isCreateDAOTextProposalFailed ||
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
    resetMultisigTransferTokenTransaction();
    resetGOVTransferTokenTransaction();
    resetSendAddMemberTransaction();
    resetDeleteMemberTransaction();
    resetReplaceMemberTransaction();
    resetChangeThresholdTransaction();
    resetCreateDAOUpgradeProposal();
    resetCreateDAOTextProposal();
  }

  function reset() {
    resetForm();
    resetTransactions();
  }

  function GetFormErrorMessage(): string {
    if (createMultisigTokenTransferError) return createMultisigTokenTransferError.message;
    if (createGOVTokenTransferError) return createGOVTokenTransferError.message;
    if (addMemberError) return addMemberError.message;
    if (deleteMemberError) return deleteMemberError.message;
    if (isReplaceMemberError) return isReplaceMemberError.message;
    if (isChangeThresholdError) return isChangeThresholdError.message;
    if (isCreateDAOUpgradeError) return isCreateDAOUpgradeError.message;
    if (isCreateDAOTextProposalError) return isCreateDAOTextProposalError.message;
    return "";
  }

  const errorMessage = GetFormErrorMessage();

  function handleCreateDAOProposalSuccess(transactionResponse: TransactionResponse) {
    reset();
    const message = `Created a new '${type}' proposal.`;
    const pathTo = `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/${Paths.DAOs.Overview}`;
    handleTransactionSuccess(transactionResponse, message, pathTo);
  }

  function onBackToDAOLinkClick() {
    navigate(backTo);
  }

  async function onSubmit(data: CreateDAOProposalForm) {
    switch (type) {
      case DAOProposalType.TokenTransfer: {
        const {
          recipientAccountId,
          tokenId,
          amount,
          decimals,
          title,
          description,
          linkToDiscussion = "",
        } = data as CreateDAOTokenTransferForm;
        switch (currentDaoType) {
          case DAOType.MultiSig.toLowerCase():
            return createMultisigTokenTransferProposal({
              tokenId,
              receiverId: recipientAccountId,
              amount: Number(amount),
              decimals,
              title,
              description,
              safeId: safeAccountId,
              multiSigDAOContractId: daoAccountId,
            });
          default:
            return createGOVTokenTransferProposal({
              tokenId,
              title,
              linkToDiscussion,
              governanceAddress: governors.tokenTransferLogic,
              governanceTokenId,
              daoContractId: daoAccountId,
              description,
              receiverId: recipientAccountId,
              amount: Number(amount),
              decimals,
              nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
            });
        }
      }
      case DAOProposalType.AddMember: {
        const { newThreshold, memberAddress, title, description } = data as CreateDAOMemberOperationForm;
        return createAddMemberProposal({
          title,
          description,
          safeAccountId,
          newMemberAddress: memberAddress,
          multiSigDAOContractId: daoAccountId,
          threshold: newThreshold,
        });
      }
      case DAOProposalType.RemoveMember: {
        const { newThreshold, memberAddress, title, description } = data as CreateDAOMemberOperationForm;
        const prevMemberAddress = getPreviousMemberAddress({ owners: ownerIds, memberId: memberAddress });
        return createDeleteMemberProposal({
          title,
          description,
          memberAddress,
          prevMemberAddress,
          safeAccountId,
          multiSigDAOContractId: daoAccountId,
          threshold: newThreshold,
        });
      }
      case DAOProposalType.ReplaceMember: {
        const { memberAddress, newMemberAddress, title, description } = data as CreateDAOMemberOperationForm;
        const prevMemberAddress = getPreviousMemberAddress({ owners: ownerIds, memberId: memberAddress });
        return createReplaceMemberProposal({
          title,
          description,
          prevMemberAddress,
          newMemberAddress: newMemberAddress,
          oldMemberAddress: memberAddress,
          safeAccountId,
          multiSigDAOContractId: daoAccountId,
        });
      }
      case DAOProposalType.UpgradeThreshold: {
        const { newThreshold, title, description } = data as CreateDAOUpgradeThresholdForm;
        return createChangeThresholdProposal({
          title,
          description,
          threshold: newThreshold,
          safeAccountId,
          multiSigDAOContractId: daoAccountId,
        });
      }
      case DAOProposalType.ContractUpgrade: {
        const { title, description, linkToDiscussion, oldProxyAddress, newImplementationAddress } =
          data as CreateDAOContractUpgradeForm;
        return createDAOUpgradeProposal({
          title,
          description,
          linkToDiscussion,
          oldProxyAddress,
          newImplementationAddress,
          governanceAddress: governors.contractUpgradeLogic,
          governanceTokenId,
          daoContractId: daoAccountId,
          nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
        });
      }
      case DAOProposalType.Text: {
        const { title, description, linkToDiscussion } = data as CreateDAOTextProposalForm;
        return createDAOTextProposal({
          title,
          description,
          linkToDiscussion,
          governanceAddress: governors.textLogic,
          governanceTokenId,
          daoContractId: daoAccountId,
          nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
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
      case DAOProposalType.ContractUpgrade:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/contract-upgrade/details`;
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
      case DAOProposalType.ContractUpgrade:
        return `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/new-proposal/contract-upgrade/review`;
      default:
        return "";
    }
  }

  async function ValidateDetailsForm(): Promise<boolean> {
    switch (type) {
      case DAOProposalType.Text:
        return trigger(["title", "description", "linkToDiscussion"]);
      case DAOProposalType.AddMember:
        return trigger(["memberAddress", "newThreshold", "title", "description"]);
      case DAOProposalType.RemoveMember:
        return trigger(["newThreshold", "memberAddress", "title", "description"]);
      case DAOProposalType.ReplaceMember:
        return trigger(["memberAddress", "newMemberAddress", "title", "description"]);
      case DAOProposalType.UpgradeThreshold:
        return trigger(["newThreshold", "title", "description"]);
      case DAOProposalType.ContractUpgrade:
        return trigger(["title", "description", "linkToDiscussion", "oldProxyAddress", "newImplementationAddress"]);
      case DAOProposalType.TokenTransfer: {
        return currentDaoType === "multisig"
          ? trigger(["title", "description", "recipientAccountId", "tokenId", "amount"])
          : trigger(["title", "description", "linkToDiscussion", "recipientAccountId", "tokenId", "amount"]);
      }
      default:
        return Promise.resolve(true);
    }
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
              title: wizardTitle,
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
                  proposalType: type,
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
