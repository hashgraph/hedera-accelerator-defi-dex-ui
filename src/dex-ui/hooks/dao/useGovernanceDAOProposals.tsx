import { useQuery } from "react-query";
import { DAOProposalGovernors, DexService, DEX_TOKEN_PRECISION_VALUE, MirrorNodeTokenById } from "@services";
import { AllFilters, DAOQueries, Proposal, ProposalEvent, ProposalStatus, ProposalType, Votes } from "./types";
import { AccountId } from "@hashgraph/sdk";
import { isNil } from "ramda";
import BigNumber from "bignumber.js";
import { ProposalData } from "@services/DexService/governance/type";
import { ContractProposalState, ProposalState } from "@store/governanceSlice";
import { getTimeRemaining, getVotingEndTime } from "@utils";

type UseDAOQueryKey = [DAOQueries.DAOs, DAOQueries.Proposals, string];

export function useGovernanceDAOProposals(
  daoAccountId: string,
  daoTokenId = "",
  governors: DAOProposalGovernors | undefined,
  proposalFilter: ProposalStatus[] = AllFilters
) {
  function filterProposalsByStatus(proposals: Proposal[]): Proposal[] {
    return proposals.filter((proposal) => proposalFilter.includes(proposal.status));
  }

  const getStatus = (state: ProposalState | undefined): ProposalStatus => {
    if (state === ProposalState.Active || state === ProposalState.Pending) {
      return ProposalStatus.Pending;
    }
    if (state === ProposalState.Queued) {
      return ProposalStatus.Queued;
    }
    if (state === ProposalState.Succeeded || state === ProposalState.Executed) {
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

  const getVotes = (proposalData: ProposalData, godTokenData: MirrorNodeTokenById | null | undefined): Votes => {
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

  const convertDataToProposal = (
    proposalData: ProposalData,
    index: number,
    godTokenData: MirrorNodeTokenById | null | undefined,
    tokenData: MirrorNodeTokenById | null | undefined
  ): Proposal => {
    const proposalState = proposalData.state
      ? (ContractProposalState[proposalData.state] as keyof typeof ContractProposalState)
      : (ContractProposalState[0] as keyof typeof ContractProposalState);
    let timeRemaining;
    if (proposalData.duration?.startBlock && proposalData.duration?.endBlock) {
      timeRemaining = getTimeRemaining(proposalData.duration?.startBlock, proposalData.duration?.endBlock).toString();
    }
    const votingEndTime = getVotingEndTime(proposalData.timestamp || "", timeRemaining || "");
    return {
      id: index,
      timeRemaining,
      nonce: 0,
      amount: proposalData.transferTokenAmount ?? 0,
      proposalId: proposalData.proposalId,
      type: proposalData.type as ProposalType,
      approvalCount: 0,
      approvers: [],
      event: ProposalEvent.Send,
      status: getStatus(ProposalState[proposalState]),
      timestamp: proposalData.timestamp ?? "",
      tokenId: proposalData.tokenToTransfer ?? "",
      token: tokenData,
      receiver: proposalData.transferToAccount ?? "",
      sender: proposalData.transferFromAccount ?? "",
      safeId: "",
      operation: 0,
      hexStringData: proposalData.data ?? "",
      msgValue: 0,
      title: proposalData.title,
      author: proposalData.proposer ? AccountId.fromSolidityAddress(proposalData.proposer).toString() : "",
      description: proposalData.description,
      link: proposalData.link,
      threshold: 0,
      contractId: proposalData.contractId ? AccountId.fromSolidityAddress(proposalData?.contractId).toString() : "",
      votes: getVotes(proposalData, godTokenData),
      hasVoted: proposalData.votingInformation?.voted,
      isQuorumReached: proposalData.votingInformation?.isQuorumReached,
      votingEndTime,
    };
  };

  return useQuery<Proposal[], Error, Proposal[], UseDAOQueryKey>(
    [DAOQueries.DAOs, DAOQueries.Proposals, daoAccountId],
    async () => {
      if (!governors) {
        return [];
      }
      const data = await Promise.all([
        DexService.fetchGovernanceDAOLogs(governors),
        DexService.fetchTokenData(daoTokenId),
      ]);
      const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();
      const proposals = await Promise.all(
        data[0].map(async (proposal, index) => {
          const tokenId = proposal.tokenToTransfer;
          let tokenData;
          if (tokenId) {
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
      enabled: !!daoAccountId && !!governors && !!daoTokenId,
      select: filterProposalsByStatus,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
