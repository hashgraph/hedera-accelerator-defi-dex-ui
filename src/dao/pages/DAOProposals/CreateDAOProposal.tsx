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
import { ErrorLayout, LoadingSpinnerLayout, NotFound, Page } from "@dex/layouts";
import { Routes } from "@dao/routes";
import { useForm } from "react-hook-form";
import { Wizard, Color, LoadingDialog } from "@shared/ui-kit";
import { WarningIcon } from "@chakra-ui/icons";
import { DAOType, GovernanceDAODetails, MultiSigDAODetails, NFTDAODetails } from "@dao/services";
import { DEFAULT_NFT_TOKEN_SERIAL_ID } from "@dex/services";
import {
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
  useCreateMultiSigDAOUpgradeProposal,
  useDAOs,
  useCreateGOVTokenAssociateProposal,
  useFetchContract,
} from "@dao/hooks";
import { useHandleTransactionSuccess, useAccountTokenBalances } from "@dex/hooks";
import { isNil } from "ramda";
import { TransactionResponse } from "@hashgraph/sdk";
import { getLastPathInRoute } from "@dex/utils";
import { getDAOType, getPreviousMemberAddress } from "../utils";

export function CreateDAOProposal() {
  const { accountId: daoAccountId = "" } = useParams();
  const daoAccountIdQueryResults = useFetchContract(daoAccountId);
  const daoAccountEVMAddress = daoAccountIdQueryResults.data?.data.evm_address;
  const daosQueryResults = useDAOs();
  const { data: daos } = daosQueryResults;
  const dao = daos?.find((dao) => dao.accountEVMAddress.toLowerCase() === daoAccountEVMAddress?.toLowerCase());
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
  const currentDaoType = location.pathname.split("/").at(1) ?? "";
  const currentWizardStep = getLastPathInRoute(location.pathname);
  const backTo = `/${currentDaoType}/${daoAccountId}/${Routes.Overview}`;
  const handleTransactionSuccess = useHandleTransactionSuccess();
  const isNotFound = daosQueryResults.isSuccess && isNil(dao);
  const { ownerIds, threshold, safeEVMAddress } = (dao as MultiSigDAODetails) ?? {};
  const daoSafeIdQueryResults = useFetchContract(safeEVMAddress ?? "");
  const safeAccountId = daoSafeIdQueryResults.data?.data.contract_id ?? "";
  const { governors, tokenId: governanceTokenId = "" } = (dao as GovernanceDAODetails | NFTDAODetails) ?? {};
  const { type } = getValues();

  const daoContractUpgradeLogicQueryResults = useFetchContract(governors?.contractUpgradeLogic ?? "");
  const daoContractUpgradeLogic = daoContractUpgradeLogicQueryResults.data?.data.contract_id ?? "";
  const daoTextLogicQueryResults = useFetchContract(governors?.textLogic ?? "");
  const daoTextLogic = daoTextLogicQueryResults.data?.data.contract_id ?? "";
  const daoTokenTransferLogicQueryResults = useFetchContract(governors?.tokenTransferLogic ?? "");
  const daoTokenTransferLogic = daoTokenTransferLogicQueryResults.data?.data.contract_id ?? "";
  const transferFrom = currentDaoType === Routes.Multisig ? safeAccountId : daoTokenTransferLogic;
  const wizardTitle = currentWizardStep === Routes.Type ? "New Proposal" : type;
  const accountTokenBalancesQueryResults = useAccountTokenBalances(
    currentDaoType === Routes.Multisig ? safeAccountId : daoAccountId
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

  const sendGOVTokenAssociateResults = useCreateGOVTokenAssociateProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateGOVTokenAssociateProposalLoading,
    isError: isCreateGOVTokenAssociateProposalFailed,
    error: isCreateGOVTokenAssociateProposalError,
    mutate: createGOVTokenAssociateProposal,
    reset: resetCreateGOVTokenAssociateProposal,
  } = sendGOVTokenAssociateResults;

  const sendMultiSigDAOTextProposalResults = useCreateMultiSigTextProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateMultiSigTextProposalLoading,
    isError: isCreateMultiSigTextProposalFailed,
    error: isCreateMultiSigTextProposalError,
    mutate: createMultiSigTextProposal,
    reset: resetCreateMultiSigTextProposal,
  } = sendMultiSigDAOTextProposalResults;

  const sendMultiSigDAOUpgradeProposalResults = useCreateMultiSigDAOUpgradeProposal(handleCreateDAOProposalSuccess);
  const {
    isLoading: isCreateMultiSigUpgradeProposalLoading,
    isError: isCreateMultiSigUpgradeProposalFailed,
    error: isCreateMultiSigUpgradeProposalError,
    mutate: createMultiSigUpgradeProposal,
    reset: resetCreateMultiSigUpgradeProposal,
  } = sendMultiSigDAOUpgradeProposalResults;

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
    isCreateGOVTokenAssociateProposalLoading ||
    isCreateMultiSigTextProposalLoading ||
    isCreateMultiSigUpgradeProposalLoading;

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
    isCreateGOVTokenAssociateProposalFailed ||
    isCreateMultiSigTextProposalFailed ||
    isCreateMultiSigUpgradeProposalFailed;

  const steps = [
    {
      label: "Type",
      route: `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOProposalType}`,
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
    resetCreateGOVTokenAssociateProposal();
    resetCreateMultiSigTextProposal();
    resetCreateMultiSigUpgradeProposal();
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
    if (isCreateGOVTokenAssociateProposalError) return isCreateGOVTokenAssociateProposalError.message;
    if (isCreateMultiSigTextProposalError) return isCreateMultiSigTextProposalError.message;
    if (isCreateMultiSigUpgradeProposalError) return isCreateMultiSigUpgradeProposalError.message;
    return "";
  }

  const errorMessage = GetFormErrorMessage();

  function handleCreateDAOProposalSuccess(transactionResponse: TransactionResponse) {
    reset();
    const message = `Created a new '${type}' proposal.`;
    const pathTo = `/${currentDaoType}/${daoAccountId}/${Routes.Overview}`;
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
          tokenType,
          nftSerialId,
          governanceNftTokenSerialId,
        } = data as CreateDAOTokenTransferForm;
        switch (getDAOType(currentDaoType)) {
          case DAOType.MultiSig:
            return createMultisigTokenTransferProposal({
              tokenId,
              receiverId: recipientAccountId,
              amount: Number(amount ?? 0),
              decimals,
              title,
              description,
              multiSigDAOContractId: daoAccountId,
              tokenType,
              nftSerialId,
            });
          case DAOType.GovernanceToken:
            return createGOVTokenTransferProposal({
              tokenId,
              title,
              linkToDiscussion,
              spenderContractId: daoTokenTransferLogic,
              governanceTokenId,
              description,
              receiverId: recipientAccountId,
              amount: Number(amount),
              decimals,
              tokenType,
              nftSerialId,
              governanceNftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
              daoType: DAOType.GovernanceToken,
            });
          case DAOType.NFT:
            if (isNil(governanceNftTokenSerialId)) return;
            return createGOVTokenTransferProposal({
              tokenId,
              title,
              linkToDiscussion,
              spenderContractId: daoTokenTransferLogic,
              governanceTokenId,
              description,
              receiverId: recipientAccountId,
              amount: Number(amount),
              decimals,
              tokenType,
              nftSerialId,
              governanceNftTokenSerialId,
              daoType: DAOType.NFT,
            });
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
        const { title, description, linkToDiscussion, oldProxyAddress, newImplementationAddress, nftTokenSerialId } =
          data as CreateDAOContractUpgradeForm;
        switch (getDAOType(currentDaoType)) {
          case DAOType.GovernanceToken:
            return createDAOUpgradeProposal({
              title,
              description,
              linkToDiscussion,
              oldProxyAddress,
              newImplementationAddress,
              spenderContractId: daoContractUpgradeLogic,
              governanceTokenId,
              nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
              daoType: DAOType.GovernanceToken,
            });
          case DAOType.MultiSig:
            return createMultiSigUpgradeProposal({
              title,
              description,
              linkToDiscussion,
              oldProxyAddress,
              newImplementationAddress,
              multiSigDAOContractId: daoAccountId,
            });
          case DAOType.NFT:
            if (isNil(nftTokenSerialId)) return;
            return createDAOUpgradeProposal({
              title,
              description,
              linkToDiscussion,
              oldProxyAddress,
              newImplementationAddress,
              spenderContractId: daoContractUpgradeLogic,
              governanceTokenId,
              nftTokenSerialId: nftTokenSerialId,
              daoType: DAOType.NFT,
            });
          default:
            return;
        }
      }
      case DAOProposalType.Text: {
        const { title, description, linkToDiscussion, nftTokenSerialId, metadata } = data as CreateDAOTextProposalForm;
        switch (getDAOType(currentDaoType)) {
          case DAOType.MultiSig:
            return createMultiSigTextProposal({
              title,
              description,
              linkToDiscussion,
              safeEVMAddress,
              multiSigDAOContractId: daoAccountId,
              metadata: metadata,
            });
          case DAOType.GovernanceToken:
            return createDAOTextProposal({
              title,
              description,
              linkToDiscussion,
              spenderContractId: daoTextLogic,
              governanceTokenId,
              daoContractId: daoAccountId,
              nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
              daoType: DAOType.GovernanceToken,
              metadata: metadata,
            });
          case DAOType.NFT:
            return createDAOTextProposal({
              title,
              description,
              linkToDiscussion,
              spenderContractId: daoTextLogic,
              governanceTokenId,
              daoContractId: daoAccountId,
              nftTokenSerialId,
              daoType: DAOType.NFT,
              metadata: metadata,
            });
          default:
            return;
        }
      }
      case DAOProposalType.TokenAssociate: {
        const { title, description, tokenId, linkToDiscussion, nftTokenSerialId } = data as CreateDAOTokenAssociateForm;
        switch (getDAOType(currentDaoType)) {
          case DAOType.MultiSig:
            return createDAOTokenAssociateProposal({
              title,
              description,
              linkToDiscussion,
              daoAccountId,
              tokenId,
            });
          case DAOType.GovernanceToken:
            return createGOVTokenAssociateProposal({
              title,
              description,
              linkToDiscussion,
              tokenId,
              governanceTokenId,
              spenderContractId: daoTokenTransferLogic,
              nftTokenSerialId: DEFAULT_NFT_TOKEN_SERIAL_ID,
              daoType: DAOType.GovernanceToken,
            });
          case DAOType.NFT:
            if (isNil(nftTokenSerialId)) return;
            return createGOVTokenAssociateProposal({
              title,
              description,
              linkToDiscussion,
              tokenId,
              governanceTokenId,
              spenderContractId: daoTokenTransferLogic,
              nftTokenSerialId,
              daoType: DAOType.NFT,
            });
          default:
            return;
        }
      }
    }
  }

  function ProposalsDetailsForm(): string {
    switch (type) {
      case DAOProposalType.Text:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOTextProposalDetails}`;
      case DAOProposalType.TokenTransfer:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOTokenTransferDetails}`;
      case DAOProposalType.AddMember:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOAddMemberDetails}`;
      case DAOProposalType.RemoveMember:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAODeleteMemberDetails}`;
      case DAOProposalType.ReplaceMember:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOReplaceMemberDetails}`;
      case DAOProposalType.UpgradeThreshold:
        return `/${currentDaoType}/${daoAccountId}/`.concat(
          `${Routes.CreateDAOProposal}/${Routes.DAOUpgradeThresholdDetails}`
        );
      case DAOProposalType.ContractUpgrade:
        return `/${currentDaoType}/${daoAccountId}/`.concat(
          `${Routes.CreateDAOProposal}/${Routes.DAOContractUpgradeDetails}`
        );
      case DAOProposalType.TokenAssociate:
        return `/${currentDaoType}/${daoAccountId}/`.concat(
          `${Routes.CreateDAOProposal}/${Routes.DAOTokenAssociateDetails}`
        );
      default:
        return "";
    }
  }

  function ProposalsReviewForm(): string {
    switch (type) {
      case DAOProposalType.Text:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOTextProposalReview}`;
      case DAOProposalType.TokenTransfer:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOTokenTransferReview}`;
      case DAOProposalType.AddMember:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOAddMemberReview}`;
      case DAOProposalType.RemoveMember:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAODeleteMemberReview}`;
      case DAOProposalType.ReplaceMember:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOReplaceMemberReview}`;
      case DAOProposalType.UpgradeThreshold:
        return `/${currentDaoType}/${daoAccountId}/`.concat(
          `${Routes.CreateDAOProposal}/${Routes.DAOUpgradeThresholdReview}`
        );
      case DAOProposalType.ContractUpgrade:
        return `/${currentDaoType}/${daoAccountId}/`.concat(
          `${Routes.CreateDAOProposal}/${Routes.DAOContractUpgradeReview}`
        );
      case DAOProposalType.TokenAssociate:
        return `/${currentDaoType}/${daoAccountId}/${Routes.CreateDAOProposal}/${Routes.DAOTokenAssociateReview}`;
      default:
        return "";
    }
  }

  async function ValidateDetailsForm(): Promise<boolean> {
    switch (type) {
      case DAOProposalType.Text:
        return currentDaoType === Routes.NFT
          ? trigger(["title", "description", "linkToDiscussion", "metadata", "nftTokenSerialId"])
          : trigger(["title", "description", "linkToDiscussion", "metadata"]);
      case DAOProposalType.AddMember:
        return trigger(["memberAddress", "newThreshold", "title", "description"]);
      case DAOProposalType.RemoveMember:
        return trigger(["newThreshold", "memberAddress", "title", "description"]);
      case DAOProposalType.ReplaceMember:
        return trigger(["memberAddress", "newMemberAddress", "title", "description"]);
      case DAOProposalType.UpgradeThreshold:
        return trigger(["newThreshold", "title", "description"]);
      case DAOProposalType.ContractUpgrade:
        return currentDaoType === Routes.NFT
          ? trigger([
              "title",
              "description",
              "linkToDiscussion",
              "oldProxyAddress",
              "newImplementationAddress",
              "nftTokenSerialId",
            ])
          : trigger(["title", "description", "linkToDiscussion", "oldProxyAddress", "newImplementationAddress"]);
      case DAOProposalType.TokenTransfer: {
        return currentDaoType === Routes.Multisig
          ? trigger(["title", "description", "recipientAccountId", "tokenId", "amount"])
          : trigger(["title", "description", "linkToDiscussion", "recipientAccountId", "tokenId", "amount"]);
      }
      case DAOProposalType.TokenAssociate:
        return trigger(["tokenId", "title", "description", "linkToDiscussion"]);
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
            form={
              <Wizard.Form
                layerStyle={
                  type === DAOProposalType.TokenTransfer && currentWizardStep === Routes.DAODetails
                    ? "dao-wizard__form"
                    : undefined
                }
              />
            }
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
