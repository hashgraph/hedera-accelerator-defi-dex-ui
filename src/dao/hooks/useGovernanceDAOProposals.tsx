import { useQuery } from "react-query";
import {
  DEX_TOKEN_PRECISION_VALUE,
  DexService,
  MirrorNodeDecodedProposalEvent,
  MirrorNodeTokenById,
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

  const getVotes = async (
    proposalData: MirrorNodeDecodedProposalEvent,
    godTokenData: MirrorNodeTokenById | null | undefined
  ): Promise<Votes> => {
    const precisionValue = godTokenData?.data.decimals ? +godTokenData?.data.decimals : DEX_TOKEN_PRECISION_VALUE;
    const yes = convertVoteNumbers(proposalData.votingInformation?.forVotes, precisionValue);
    const no = convertVoteNumbers(proposalData.votingInformation?.againstVotes, precisionValue);
    const abstain = convertVoteNumbers(proposalData.votingInformation?.abstainVotes, precisionValue);

    let max = 0;
    try {
      if (daoTokenId && proposalData.timestamp) {
        const snapshotResp: any = await DexService.fetchTokenBalancesAt(daoTokenId, proposalData.timestamp);
        const balances = snapshotResp?.data?.balances ?? snapshotResp?.balances ?? [];

        const governorId = governorAddress ? solidityAddressToAccountIdString(governorAddress) : undefined;
        const assetHolderId = assetHolderEVMAddress
          ? solidityAddressToAccountIdString(assetHolderEVMAddress)
          : undefined;
        const blacklist = new Set([governorId, assetHolderId].filter(Boolean) as string[]);

        const eligibleBalances = balances.filter((b: any) => {
          const bal = new BigNumber((b?.balance ?? 0).toString());
          const accountId = b?.account;
          return bal.gt(0) && !blacklist.has(accountId);
        });

        const snapshotEligibleSupplyRaw = eligibleBalances.reduce(
          (acc: BigNumber, b: any) => acc.plus(new BigNumber((b?.balance ?? 0).toString())),
          new BigNumber(0)
        );
        max = snapshotEligibleSupplyRaw.shiftedBy(-precisionValue).toNumber();
      }
    } catch (e) {
      /* empty */
    }

    if (!max) {
      const totalGodTokenSupply = godTokenData?.data?.total_supply;
      max = !isNil(totalGodTokenSupply)
        ? BigNumber(totalGodTokenSupply.toString()).shiftedBy(-precisionValue).toNumber()
        : 0;
    }

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
      case GovernanceProposalType.RiskParametersProposal: {
        return {
          maxTradeBps: proposalData.maxTradeBps ?? 0,
          maxSlippageBps: proposalData.maxSlippageBps ?? 0,
          tradeCooldownSec: proposalData.tradeCooldownSec ?? 0,
        };
      }
      case GovernanceProposalType.AddTradingPairProposal: {
        return {
          tokenIn: proposalData.tokenIn ?? "",
          tokenOut: proposalData.tokenOut ?? "",
        };
      }
      case GovernanceProposalType.RemoveTradingPairProposal: {
        return {
          tokenIn: proposalData.tokenIn ?? "",
          tokenOut: proposalData.tokenOut ?? "",
        };
      }
      default:
        return undefined;
    }
  };

  const getProposalType = (type: GovernanceProposalType) => {
    switch (Number(type)) {
      case GovernanceProposalType.RiskParametersProposal: {
        return ProposalType.RiskParametersProposal;
      }
      case GovernanceProposalType.AddTradingPairProposal: {
        return ProposalType.AddTraidingPairProposal;
      }
      case GovernanceProposalType.RemoveTradingPairProposal: {
        return ProposalType.RemoveTraidingPairProposal;
      }
      default: {
        return ProposalType.TokenTransfer;
      }
    }
  };

  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const currentWalletId = wallet?.savedPairingData?.accountIds[0] ?? "";

  const convertDataToProposal = async (
    proposalData: ProposalData,
    index: number,
    godTokenData: MirrorNodeTokenById | null | undefined,
    tokenData: MirrorNodeTokenById | null | undefined
  ): Promise<Proposal> => {
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
      votes: await getVotes(proposalData, godTokenData),
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
        DexService.fetchGovernanceDAOLogs(governorAddress),
        DexService.fetchTokenData(daoTokenId),
      ]);
      const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();
      return await Promise.all(
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
    },
    {
      enabled: !!daoAccountId && !!governorAddress && !!daoTokenId && !!assetHolderEVMAddress,
      select: filterProposalsByStatus,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
