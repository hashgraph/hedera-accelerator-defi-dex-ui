import { useQuery } from "react-query";
import {
  convertEthersBigNumberToBigNumberJS,
  DAOEvents,
  DexService,
  MirrorNodeTokenById,
  getThreshold,
} from "@services";
import { AllFilters, DAOQueries, Proposal, ProposalEvent, ProposalStatus, ProposalType } from "./types";
import { AccountId } from "@hashgraph/sdk";
import { groupBy, isNil } from "ramda";
import { LogDescription } from "ethers/lib/utils";
import { BigNumber } from "ethers";

type UseDAOQueryKey = [DAOQueries.DAOs, DAOQueries.Proposals, string, string];

export function useDAOProposals(
  daoAccountId: string,
  safeAccountId: string,
  proposalFilter: ProposalStatus[] = AllFilters
) {
  function filterProposalsByStatus(proposals: Proposal[]): Proposal[] {
    return proposals.filter((proposal) => proposalFilter.includes(proposal.status));
  }

  const groupByTransactionHash = groupBy(function (log: LogDescription) {
    if (isNil(log?.args)) return "undefined";
    const { txHash, approvedHash, txnHash } = log.args;
    return txHash || approvedHash || txnHash;
  });

  function groupLogsByTransactionHash(logs: LogDescription[]): [string, LogDescription[]][] {
    const logsGroupedByTransactionHash = groupByTransactionHash(logs);
    delete logsGroupedByTransactionHash["undefined"];
    const proposalEntries = Object.entries(logsGroupedByTransactionHash);
    return proposalEntries;
  }

  function getApprovers(proposalLogs: LogDescription[], transactionHash: string): string[] {
    const approverCache = new Set<string>();
    proposalLogs.forEach((log: LogDescription) => {
      if (
        log?.name === DAOEvents.ApproveHash &&
        !approverCache.has(log?.args.owner) &&
        transactionHash === log?.args?.approvedHash
      ) {
        const { args } = log;
        const ownerId = AccountId.fromSolidityAddress(args.owner).toString();
        approverCache.add(ownerId);
      }
    });
    return Array.from(approverCache);
  }

  function getProposalStatus(proposalLogs: LogDescription[], isThresholdReached: boolean): ProposalStatus {
    return proposalLogs.find((log) => log.name === DAOEvents.ExecutionSuccess)
      ? ProposalStatus.Success
      : proposalLogs.find((log) => log.name === DAOEvents.ExecutionFailure)
      ? ProposalStatus.Failed
      : isThresholdReached
      ? ProposalStatus.Queued
      : ProposalStatus.Pending;
  }

  function getProposalType(transactionType: number): ProposalType {
    switch (transactionType) {
      case 1:
        return ProposalType.TokenTransfer;
      case 2:
        return ProposalType.AddNewMember;
      case 3:
        return ProposalType.RemoveMember;
      case 4:
        return ProposalType.ReplaceMember;
      case 5:
        return ProposalType.ChangeThreshold;
      default:
        return ProposalType.TokenTransfer;
    }
  }

  return useQuery<Proposal[], Error, Proposal[], UseDAOQueryKey>(
    [DAOQueries.DAOs, DAOQueries.Proposals, daoAccountId, safeAccountId],
    async () => {
      const logs = await Promise.all([
        DexService.fetchMultiSigDAOLogs(daoAccountId),
        DexService.fetchHederaGnosisSafeLogs(safeAccountId),
      ]);
      const daoAndSafeLogs = logs ? logs.flat() : [];
      const groupedProposalEntries = groupLogsByTransactionHash(daoAndSafeLogs);
      const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();
      const proposals: Proposal[] = await Promise.all(
        groupedProposalEntries.map(async ([transactionHash, proposalLogs], index) => {
          const proposalInfo: any = proposalLogs.find((log) => log.name === DAOEvents.TransactionCreated)?.args.info;
          const {
            nonce,
            to,
            value,
            data,
            operation,
            hexStringData,
            title,
            description,
            creator,
            linkToDiscussion,
            transactionType,
          } = proposalInfo;
          const { amount, receiver, token, _threshold } = data;
          const threshold = getThreshold(daoAndSafeLogs, BigNumber.from(_threshold ?? 0));
          const approvers = getApprovers(proposalLogs, transactionHash);
          const approvalCount = approvers.length;
          const isThresholdReached = approvalCount >= threshold;
          const status = getProposalStatus(proposalLogs, isThresholdReached);
          const proposalType = getProposalType(BigNumber.from(transactionType).toNumber());
          const tokenId = token ? AccountId.fromSolidityAddress(token).toString() : "";
          if (!tokenDataCache.has(tokenId)) {
            tokenDataCache.set(tokenId, DexService.fetchTokenData(tokenId));
          }
          const tokenData = await tokenDataCache.get(tokenId);
          return {
            id: index,
            nonce: nonce ? BigNumber.from(nonce).toNumber() : 0,
            amount: amount ? convertEthersBigNumberToBigNumberJS(amount).toNumber() : 0,
            transactionHash,
            type: proposalType,
            approvalCount,
            approvers,
            event: ProposalEvent.Send,
            status,
            // TODO: Add real value for timestamp
            timestamp: "",
            tokenId: tokenId,
            token: tokenData,
            receiver: receiver ? AccountId.fromSolidityAddress(receiver).toString() : "",
            safeId: to ? AccountId.fromSolidityAddress(to).toString() : "",
            operation,
            hexStringData,
            msgValue: value ? BigNumber.from(value).toNumber() : 0,
            title: title,
            author: creator ? AccountId.fromSolidityAddress(creator).toString() : "",
            description: description,
            link: linkToDiscussion,
            threshold,
          };
        })
      );
      return proposals;
    },
    {
      enabled: !!daoAccountId && !!safeAccountId,
      select: filterProposalsByStatus,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
