import { useQuery } from "react-query";
import {
  DexService,
  DEX_TOKEN_PRECISION_VALUE,
  MirrorNodeTokenById,
  MirrorNodeDecodedProposalEvent,
} from "@dex/services";
import { AllFilters, DAOQueries, Proposal, ProposalEvent, ProposalStatus, ProposalType, Votes } from "./types";
import { isEmpty, isNil, isNotNil } from "ramda";
import BigNumber from "bignumber.js";
import { ContractProposalState, GovernanceProposalType, ProposalState } from "@dex/store";
import { solidityAddressToAccountIdString } from "@shared/utils";
import { ProposalData } from "@dex/services/DexService/governance/type";
import { useDexContext } from "@dex/hooks";

type UseDAOQueryKey = [DAOQueries.DAOs, DAOQueries.Proposals, string];

export function useGovernanceDAOProposals(
  daoAccountId: string,
  daoTokenId = "",
  governorAddress: string | undefined,
  assetHolderEVMAddress: string | undefined,
  proposalFilter: ProposalStatus[] = AllFilters
) {
  function filterProposalsByStatus(proposals: Proposal[]): Proposal[] {
    return proposals.filter((proposal) => proposalFilter.includes(proposal.status));
  }

  const getStatus = (state: ProposalState | undefined): ProposalStatus => {
    if (state === ProposalState.Active || state === ProposalState.Pending) {
      return ProposalStatus.Pending;
    }
    if (state === ProposalState.Succeeded || state === ProposalState.Queued) {
      return ProposalStatus.Queued;
    }
    if (state === ProposalState.Executed) {
      return ProposalStatus.Success;
    }
    if (state === ProposalState.Canceled || state === ProposalState.Defeated || state === ProposalState.Expired) {
      return ProposalStatus.Failed;
    }
    return ProposalStatus.Pending;
  };

  const convertVoteNumbers = (voteNumber: number | undefined, precisionValue: number): number => {
    if (isNil(voteNumber)) return 0;
    return Number(BigNumber(voteNumber).shiftedBy(-precisionValue).toFixed(3));
  };

  const getVotes = (
    proposalData: MirrorNodeDecodedProposalEvent,
    godTokenData: MirrorNodeTokenById | null | undefined
  ): Votes => {
    const totalGodTokenSupply = godTokenData?.data?.total_supply;
    const precisionValue = godTokenData?.data.decimals ? +godTokenData?.data.decimals : DEX_TOKEN_PRECISION_VALUE;
    const yes = convertVoteNumbers(proposalData.votingInformation?.forVotes, precisionValue);
    const no = convertVoteNumbers(proposalData.votingInformation?.againstVotes, precisionValue);
    const abstain = convertVoteNumbers(proposalData.votingInformation?.abstainVotes, precisionValue);
    const max = !isNil(totalGodTokenSupply)
      ? BigNumber(totalGodTokenSupply.toString()).shiftedBy(-precisionValue).toNumber()
      : 0;
    const totalVotes = yes + no + abstain;
    const remaining = max - totalVotes;
    const quorum = max
      ? BigNumber(proposalData.votingInformation?.quorumValue ?? 0)
          .shiftedBy(-precisionValue)
          .toNumber()
      : 0;
    const turnout = max ? Math.round(((totalVotes ?? 0) * 100) / max) : 0;
    return {
      yes,
      no,
      abstain,
      quorum,
      remaining,
      max,
      turnout,
    };
  };

  const getFormattedProposalData = (proposalType: number, proposalData: ProposalData) => {
    switch (proposalType) {
      case GovernanceProposalType.TRANSFER: {
        return {
          transferFromAccount: proposalData.transferFromAccount ?? "",
          transferToAccount: proposalData.transferToAccount ?? "",
          tokenToTransfer: proposalData.tokenToTransfer ?? "",
          transferTokenAmount: proposalData.transferTokenAmount ?? 0,
        };
      }
      case GovernanceProposalType.ASSOCIATE: {
        return {
          tokenAddress: proposalData.tokenAddress ?? "",
        };
      }
      case GovernanceProposalType.UPGRADE_PROXY: {
        return {
          proxy: proposalData?.proxy ?? "",
          proxyAdmin: proposalData?.proxyAdmin ?? "",
          proxyLogic: proposalData?.proxyLogic ?? "",
          currentLogic: proposalData?.currentLogic ?? "",
          isAdminApproved: proposalData?.isAdminApproved ?? false,
          isAdminApprovalButtonVisible: proposalData?.isAdminApprovalButtonVisible ?? false,
        };
      }
      default:
        return undefined;
    }
  };

  const getProposalType = (type: GovernanceProposalType) => {
    switch (Number(type)) {
      case GovernanceProposalType.ASSOCIATE: {
        return ProposalType.TokenAssociate;
      }
      case GovernanceProposalType.SET_TEXT: {
        return ProposalType.TextProposal;
      }
      case GovernanceProposalType.TRANSFER: {
        return ProposalType.TokenTransfer;
      }
      case GovernanceProposalType.UPGRADE_PROXY: {
        return ProposalType.UpgradeContract;
      }
      default: {
        return ProposalType.TokenTransfer;
      }
    }
  };

  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const currentWalletId = wallet?.savedPairingData?.accountIds[0] ?? "";

  const convertDataToProposal = (
    proposalData: ProposalData,
    index: number,
    godTokenData: MirrorNodeTokenById | null | undefined,
    tokenData: MirrorNodeTokenById | null | undefined
  ): Proposal => {
    const proposalState = proposalData.state
      ? (ContractProposalState[proposalData.state] as keyof typeof ContractProposalState)
      : (ContractProposalState[0] as keyof typeof ContractProposalState);
    const endTime = proposalData?.coreInformation?.voteEnd;
    const currentTime = new Date().getTime();
    const timeRemaining = currentTime < endTime ? (endTime - currentTime) / 1000 : 0;
    const hasVoted = isNotNil(
      proposalData.votersList?.find(
        (voterInfo) => currentWalletId === solidityAddressToAccountIdString(voterInfo.voter)
      )
    );
    return {
      id: index,
      timeRemaining,
      nonce: 0,
      amount: proposalData.transferTokenAmount ?? 0,
      proposalId: proposalData.proposalId,
      type: getProposalType(proposalData.coreInformation.inputs.proposalType),
      approvalCount: 0,
      approvers: [],
      event: ProposalEvent.Send,
      status: getStatus(ProposalState[proposalState]),
      timestamp: proposalData.timestamp,
      tokenId: proposalData.tokenAddress ?? "",
      token: tokenData,
      receiver: proposalData.transferToAccount ?? "",
      sender: "",
      safeEVMAddress: "",
      to: "",
      operation: 0,
      hexStringData: "",
      msgValue: 0,
      title: proposalData.coreInformation.inputs.title,
      author: proposalData.coreInformation.creator
        ? solidityAddressToAccountIdString(proposalData.coreInformation.creator)
        : "",
      description: proposalData.coreInformation.inputs.description,
      metadata: proposalData.coreInformation.inputs.metadata,
      link: proposalData.coreInformation.inputs.discussionLink,
      threshold: 0,
      contractEvmAddress: proposalData.contractId,
      votes: getVotes(proposalData, godTokenData),
      hasVoted,
      isQuorumReached: proposalData.votingInformation?.isQuorumReached,
      votingEndTime: endTime,
      proposalState: ProposalState[proposalState],
      data: getFormattedProposalData(Number(proposalData.coreInformation.inputs.proposalType), proposalData),
      isContractUpgradeProposal:
        Number(proposalData.coreInformation.inputs.proposalType) === GovernanceProposalType.UPGRADE_PROXY,
      coreInformation: proposalData.coreInformation,
    };
  };

  return useQuery<Proposal[], Error, Proposal[], UseDAOQueryKey>(
    [DAOQueries.DAOs, DAOQueries.Proposals, daoAccountId],
    async () => {
      if (!governorAddress || !assetHolderEVMAddress) {
        return [];
      }
      const data = await Promise.all([
        DexService.fetchGovernanceDAOLogs(governorAddress, assetHolderEVMAddress),
        DexService.fetchTokenData(daoTokenId),
      ]);
      const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();
      const proposals = await Promise.all(
        data[0].map(async (proposal, index) => {
          const tokenId = proposal.tokenToTransfer ?? "";
          let tokenData;
          if (!isEmpty(tokenId)) {
            if (!tokenDataCache.has(tokenId)) {
              tokenDataCache.set(tokenId, DexService.fetchTokenData(tokenId));
            }
            tokenData = await tokenDataCache.get(tokenId);
          }
          return convertDataToProposal(proposal, index, data[1], tokenData);
        })
      );
      return proposals;
    },
    {
      enabled: !!daoAccountId && !!governorAddress && !!daoTokenId && !!assetHolderEVMAddress,
      select: filterProposalsByStatus,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
