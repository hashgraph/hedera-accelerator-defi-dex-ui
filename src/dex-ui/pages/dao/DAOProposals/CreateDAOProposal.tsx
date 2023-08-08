import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  CreateDAOContractUpgradeForm,
  CreateDAOMemberOperationForm,
  CreateDAOProposalForm,
  CreateDAOTextProposalForm,
  CreateDAOTokenTransferForm,
  CreateDAOUpgradeThresholdForm,
  CreateDAOTokenAssociateForm,
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
  useAccountTokenBalances,
  useCreateAddMemberProposal,
  useCreateChangeThresholdProposal,
  useCreateDAOTextProposal,
  useCreateDAOTokenAssociateProposal,
  useCreateDAOTokenTransferProposal,
  useCreateDAOUpgradeProposal,
  useCreateDeleteMemberProposal,
  useCreateMultiSigProposal,
  useCreateReplaceMemberProposal,
  useCreateMultiSigTextProposal,
  useDAOs,
  useDexContext,
  useHandleTransactionSuccess,
} from "@hooks";
import { isNil } from "ramda";
import { TransactionResponse } from "@hashgraph/sdk";
import { getLastPathInRoute } from "@utils";
import { getDAOType, getPreviousMemberAddress } from "../utils";

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
  const currentWizardStep = getLastPathInRoute(location.pathname);
  const backTo = `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/${Paths.DAOs.Overview}`;
  const daosQueryResults = useDAOs(daoAccountId);
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountId === daoAccountId);
  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const { ownerIds, safeId: safeAccountId = "", threshold, safeEVMAddress } = (dao as MultiSigDAODetails) ?? {};
  const { governors, tokenId: governanceTokenId = "" } = (dao as GovernanceDAODetails | NFTDAODetails) ?? {};
  const { type } = getValues();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const walletId = wallet.savedPairingData?.accountIds[0] ?? "";
  const transferFrom = currentDaoType === Paths.DAOs.Multisig ? safeAccountId : walletId;
  const wizardTitle = currentWizardStep === "type" ? "New Proposal" : type;

  const accountTokenBalancesQueryResults = useAccountTokenBalances(
    currentDaoType === Paths.DAOs.Multisig ? safeAccountId : daoAccountId
  );
  const { data: tokenBalances } = accountTokenBalancesQueryResults;

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

  const sendDAOTokenAssociateResults = useCreateDAOTokenAssociateProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateTokenAssociateProposalLoading,
    isError: isCreateTokenAssociateProposalFailed,
    error: isCreateTokenAssociateProposalError,
    mutate: createDAOTokenAssociateProposal,
    reset: resetCreateDAOTokenAssociateProposal,
  } = sendDAOTokenAssociateResults;

  const sendMultiSigDAOTextProposalResults = useCreateMultiSigTextProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateMultiSigTextProposalLoading,
    isError: isCreateMultiSigTextProposalFailed,
    error: isCreateMultiSigTextProposalError,
    mutate: createMultiSigTextProposal,
    reset: resetCreateMultiSigTextProposal,
  } = sendMultiSigDAOTextProposalResults;

  const isLoading =
    isCreateMultisigTokenTransferLoading ||
    isCreateGOVTokenTransferLoading ||
    isAddMemberLoading ||
    isDeleteMemberLoading ||
    isReplaceMemberLoading ||
    isCreateDAOUpgradeLoading ||
    isCreateDAOTextProposalLoading ||
    isChangeThresholdLoading ||
    isCreateTokenAssociateProposalLoading ||
    isCreateMultiSigTextProposalLoading;

  const isError =
    isCreateMultisigTokenTransferFailed ||
    isCreateGOVTokenTransferFailed ||
    isAddMemberFailed ||
    isDeleteMemberFailed ||
    isReplaceMemberFailed ||
    isCreateDAOUpgradeFailed ||
    isCreateDAOTextProposalFailed ||
    isChangeThresholdFailed ||
    isCreateTokenAssociateProposalFailed ||
    isCreateMultiSigTextProposalFailed;

  const steps = [
    {
      label: "Type",
      route:
        `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
        `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOProposalType}`,
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
    resetCreateDAOTokenAssociateProposal();
    resetCreateMultiSigTextProposal();
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
    if (isCreateTokenAssociateProposalError) return isCreateTokenAssociateProposalError.message;
    if (isCreateMultiSigTextProposalError) return isCreateMultiSigTextProposalError.message;
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
        switch (getDAOType(currentDaoType)) {
          case DAOType.MultiSig:
            return createMultisigTokenTransferProposal({
              tokenId,
              receiverId: recipientAccountId,
              amount: Number(amount),
              decimals,
              title,
              description,
              safeEVMAddress,
              multiSigDAOContractId: daoAccountId,
            });
          case DAOType.GovernanceToken:
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
          case DAOType.NFT:
            return;
          default:
            return;
        }
      }
      case DAOProposalType.AddMember: {
        const { newThreshold, memberAddress, title, description } = data as CreateDAOMemberOperationForm;
        return createAddMemberProposal({
          title,
          description,
          safeEVMAddress,
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
          safeEVMAddress,
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
          safeEVMAddress,
          multiSigDAOContractId: daoAccountId,
        });
      }
      case DAOProposalType.UpgradeThreshold: {
        const { newThreshold, title, description } = data as CreateDAOUpgradeThresholdForm;
        return createChangeThresholdProposal({
          title,
          description,
          threshold: newThreshold,
          safeEVMAddress,
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
        const { title, description, linkToDiscussion, nftTokenSerialId } = data as CreateDAOTextProposalForm;
        switch (getDAOType(currentDaoType)) {
          case DAOType.MultiSig:
            return createMultiSigTextProposal({
              title,
              description,
              linkToDiscussion,
              safeEVMAddress,
              multiSigDAOContractId: daoAccountId,
            });
          case DAOType.GovernanceToken:
            return createDAOTextProposal({
              title,
              description,
              linkToDiscussion,
              governanceAddress: governors.textLogic,
              governanceTokenId,
              daoContractId: daoAccountId,
              nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
              daoType: DAOType.GovernanceToken,
            });
          case DAOType.NFT:
            return createDAOTextProposal({
              title,
              description,
              linkToDiscussion,
              governanceAddress: governors.textLogic,
              governanceTokenId,
              daoContractId: daoAccountId,
              nftTokenSerialId,
              daoType: DAOType.NFT,
            });
          default:
            return;
        }
      }
      case DAOProposalType.TokenAssociate: {
        const { title, description, tokenId } = data as CreateDAOTokenAssociateForm;
        return createDAOTokenAssociateProposal({
          title,
          description,
          linkToDiscussion: "", //TODO: To be removed from SC
          daoAccountId,
          tokenId,
        });
      }
    }
  }

  function ProposalsDetailsForm(): string {
    switch (type) {
      case DAOProposalType.Text:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOTextProposalDetails}`
        );
      case DAOProposalType.TokenTransfer:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOTokenTransferDetails}`
        );
      case DAOProposalType.AddMember:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOAddMemberDetails}`
        );
      case DAOProposalType.RemoveMember:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAODeleteMemberDetails}`
        );
      case DAOProposalType.ReplaceMember:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOReplaceMemberDetails}`
        );
      case DAOProposalType.UpgradeThreshold:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOUpgradeThresholdDetails}`
        );
      case DAOProposalType.ContractUpgrade:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOContractUpgradeDetails}`
        );
      case DAOProposalType.TokenAssociate:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOTokenAssociateDetails}`
        );
      default:
        return "";
    }
  }

  function ProposalsReviewForm(): string {
    switch (type) {
      case DAOProposalType.Text:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOTextProposalReview}`
        );
      case DAOProposalType.TokenTransfer:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOTokenTransferReview}`
        );
      case DAOProposalType.AddMember:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOAddMemberReview}`
        );
      case DAOProposalType.RemoveMember:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAODeleteMemberReview}`
        );
      case DAOProposalType.ReplaceMember:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOReplaceMemberReview}`
        );
      case DAOProposalType.UpgradeThreshold:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOUpgradeThresholdReview}`
        );
      case DAOProposalType.ContractUpgrade:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOContractUpgradeReview}`
        );
      case DAOProposalType.TokenAssociate:
        return (
          `${Paths.DAOs.absolute}/${currentDaoType}/${daoAccountId}/` +
          `${Paths.DAOs.CreateDAOProposal}/${Paths.DAOs.DAOTokenAssociateReview}`
        );
      default:
        return "";
    }
  }

  async function ValidateDetailsForm(): Promise<boolean> {
    switch (type) {
      case DAOProposalType.Text:
        return currentDaoType === Paths.DAOs.NFT
          ? trigger(["title", "description", "linkToDiscussion", "nftTokenSerialId"])
          : trigger(["title", "description", "linkToDiscussion"]);
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
      case DAOProposalType.TokenAssociate:
        return trigger(["tokenId", "title", "description"]);
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
                  assets: tokenBalances,
                  governanceTokenId,
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
