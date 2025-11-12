import { useQuery } from "react-query";
import { DexService, convertEthersBigNumberToBigNumberJS } from "@dex/services";
import {
  DAOQueries,
  GOVHuffyRiskParametersProposalDetails,
  Proposal,
  ProposalEvent,
  ProposalStatus,
  ProposalType,
  Votes,
} from "./types";
import { groupBy } from "lodash";
import { BigNumber } from "ethers";
import { solidityAddressToAccountIdString } from "@shared/utils";
import { LogDescription } from "ethers/lib/utils";
import { DAOEvents } from "@dao/services";
import { GovernanceProposalType } from "@dex/store";

export const GOVERNOR_ADDRESS: string = import.meta.env.VITE_GOVERNOR_ADDRESS.trim();

export function useDAOProposals(daoAccountId: string) {
  function groupByProposalId(logs: any[]): [string, any[]][] {
    const grouped = groupBy(logs, (log: any) => log?.proposalId?.toString() ?? "undefined");
    delete (grouped as Record<string, any[]>).undefined;
    return Object.entries(grouped);
  }

  function getProposalStatus(
    proposalLogs: LogDescription[],
    isThresholdReached: boolean,
    type: ProposalType,
    isAdminApproved: boolean
  ): ProposalStatus {
    switch (type) {
      case ProposalType.UpgradeContract: {
        return proposalLogs.find((log) => log.name === DAOEvents.ExecutionSuccess)
          ? ProposalStatus.Success
          : proposalLogs.find((log) => log.name === DAOEvents.ExecutionFailure)
          ? ProposalStatus.Failed
          : isThresholdReached && isAdminApproved
          ? ProposalStatus.Queued
          : ProposalStatus.Pending;
      }
      default: {
        return proposalLogs.find((log) => log.name === DAOEvents.ExecutionSuccess)
          ? ProposalStatus.Success
          : proposalLogs.find((log) => log.name === DAOEvents.ExecutionFailure)
          ? ProposalStatus.Failed
          : isThresholdReached
          ? ProposalStatus.Queued
          : ProposalStatus.Pending;
      }
    }
  }

  return useQuery<Proposal[], Error>(
    [DAOQueries.DAOs, DAOQueries.Proposals, daoAccountId],
    async () => {
      const logs: any[] = await DexService.fetchGovernanceDAOLogs(GOVERNOR_ADDRESS);
      const groupedProposals = groupByProposalId(logs);

      const proposals: Proposal[] = await Promise.all(
        groupedProposals.map(async ([proposalId, proposalLogs], index) => {
          const proposalInfo = proposalLogs?.[0] ?? {};
          // eslint-disable-next-line max-len
          const status = getProposalStatus(
            proposalLogs,
            proposalInfo.isThresholdReached,
            proposalInfo.type,
            proposalInfo.isAdminApproved
          );

          const forVotesBn = BigNumber.from(proposalInfo.forVotes ?? 0);
          const againstVotesBn = BigNumber.from(proposalInfo.againstVotes ?? 0);
          const abstainVotesBn = BigNumber.from(proposalInfo.abstainVotes ?? 0);
          const quorumBn = BigNumber.from(proposalInfo.quorumValue ?? 0);

          const yes = convertEthersBigNumberToBigNumberJS(forVotesBn).toNumber();
          const no = convertEthersBigNumberToBigNumberJS(againstVotesBn).toNumber();
          const abstain = convertEthersBigNumberToBigNumberJS(abstainVotesBn).toNumber();
          const quorum = convertEthersBigNumberToBigNumberJS(quorumBn).toNumber();

          const max = yes + no + abstain;
          const remaining = quorum > 0 ? Math.max(quorum - max, 0) : undefined;
          const turnout = quorum > 0 ? Math.min((max / quorum) * 100, 100) : undefined;

          const votes: Votes = {
            yes,
            no,
            abstain,
            quorum,
            remaining,
            max,
            turnout,
          };

          console.log("proposalInfo", proposalInfo);
          const timestamp = proposalInfo.timestamp ?? proposalInfo.coreInformation.createdAt ?? "";
          const title = proposalInfo.coreInformation.inputs.title;
          const description = proposalInfo.coreInformation.inputs.description;
          const authorRaw = proposalInfo.coreInformation.creator;
          const author = authorRaw ? solidityAddressToAccountIdString(authorRaw) : "";
          const amount = yes;
          const typeValue = Number(proposalInfo.coreInformation.inputs.proposalType);
          const typeKey = GovernanceProposalType[typeValue as unknown as keyof typeof GovernanceProposalType];

          let preparedData;
          switch (typeValue) {
            case GovernanceProposalType.RiskParametersProposal:
              preparedData = {
                maxTradeBps: proposalInfo.maxTradeBps,
                maxSlippageBps: proposalInfo.maxSlippageBps,
                tradeCooldownSec: proposalInfo.tradeCooldownSec,
              } as GOVHuffyRiskParametersProposalDetails;
              break;
            case GovernanceProposalType.AddTradingPairProposal:
            case GovernanceProposalType.RemoveTradingPairProposal:
              preparedData = {
                tokenIn: proposalInfo.tokenIn,
                tokenOut: proposalInfo.tokenOut,
              };
          }

          return {
            id: index,
            nonce: 0,
            transactionHash: proposalId ?? "",
            amount,
            type: typeKey as any,
            approvalCount: yes,
            approvers: [],
            event: ProposalEvent.Governance,
            status,
            timestamp: String(timestamp),
            tokenId: "",
            token: undefined,
            receiver: "",
            sender: undefined,
            safeEVMAddress: "",
            to: "",
            operation: 0,
            hexStringData: "",
            data: preparedData,
            msgValue: 0,
            title,
            author,
            description,
            metadata: proposalInfo.metadata ?? "",
            link: proposalInfo.discussionLink ?? "",
            threshold: 0,
            proposalId: String(proposalId ?? ""),
            contractEvmAddress: proposalInfo.contractId ?? undefined,
            timeRemaining: undefined,
            votes,
            hasVoted: proposalInfo.hasVoted ?? false,
            isQuorumReached: proposalInfo.isQuorumReached ?? false,
            votingEndTime: proposalInfo.voteEnd ? Number(proposalInfo.voteEnd) : undefined,
            proposalState: proposalInfo.proposalState,
            coreInformation: proposalInfo.coreInformation ?? undefined,
            showTransferOwnerShip: false,
            currentOwner: undefined,
            targetId: undefined,
            feeConfigControllerUser: "",
            isContractUpgradeProposal: false,
          } as Proposal;
        })
      );

      return proposals;
    },
    {
      enabled: !!daoAccountId,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
