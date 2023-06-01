import { useQuery } from "react-query";
import { DAOEvents, DexService, MirrorNodeTokenById } from "../../services";
import { DAOQueries } from "./types";
import { AccountId } from "@hashgraph/sdk";
import { groupBy, isNil } from "ramda";
import { LogDescription } from "ethers/lib/utils";
import { BigNumber } from "ethers";

export enum ProposalStatus {
  Pending = "Pending",
  Queued = "Queued",
  Success = "Success",
  Failed = "Failed",
}

export enum ProposalEvent {
  Send = "Send",
  Receive = "Receive",
  Governance = "Governance",
  SafeCreated = "Safe Created",
}

export enum ProposalType {
  TokenTransfer = "Token Transfer",
  AddNewMember = "Add New Member",
  RemoveMember = "Remove Member",
  ReplaceMember = "Replace Member",
}

export interface Proposal {
  nonce: number;
  transactionHash: string;
  amount: number;
  type: ProposalType;
  approvalCount: number;
  approvers: string[];
  event: ProposalEvent;
  status: ProposalStatus;
  timestamp: string;
  tokenId: string;
  token: MirrorNodeTokenById | null | undefined;
  receiver: string;
  safeId: string;
  operation: number;
  hexStringData: string;
  /**
   * The hbar value sent when creating the proposal. This value is needed to
   * compute the correct hash value when executing the proposal in the HederaGnosisSafe contract.
   **/
  msgValue: number;
}

const AllFilters = [ProposalStatus.Success, ProposalStatus.Failed, ProposalStatus.Pending];
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

  function getApprovers(proposalLogs: LogDescription[]): string[] {
    const approverCache = new Set<string>();
    proposalLogs.forEach((log: LogDescription) => {
      if (log?.name === DAOEvents.ApproveHash && !approverCache.has(log?.args.owner)) {
        const { args } = log;
        const ownerId = AccountId.fromSolidityAddress(args.owner).toString();
        approverCache.add(ownerId);
      }
    });
    return Array.from(approverCache);
  }

  function getProposalStatus(proposalLogs: LogDescription[]): ProposalStatus {
    return proposalLogs.find((log) => log.name === DAOEvents.ExecutionSuccess)
      ? ProposalStatus.Success
      : proposalLogs.find((log) => log.name === DAOEvents.ExecutionFailure)
      ? ProposalStatus.Failed
      : ProposalStatus.Pending;
  }

  return useQuery<Proposal[], Error, Proposal[], UseDAOQueryKey>(
    [DAOQueries.DAOs, DAOQueries.Proposals, daoAccountId, safeAccountId],
    async () => {
      const logs = await Promise.all([
        DexService.fetchMultiSigDAOLogs(daoAccountId),
        DexService.fetchHederaGnosisSafeLogs(safeAccountId),
      ]);

      const daoAndSafeLogs = logs.flat();
      const groupedProposalEntries = groupLogsByTransactionHash(daoAndSafeLogs);
      const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();

      const proposals: Proposal[] = await Promise.all(
        groupedProposalEntries.map(async ([transactionHash, proposalLogs]) => {
          const proposalInfo = proposalLogs.find((log) => log.name === DAOEvents.TransactionCreated)?.args.info;
          const { nonce, to, value, data, operation, hexStringData } = proposalInfo;
          const { amount, receiver, token } = data;

          const approvers = getApprovers(proposalLogs);
          const approvalCount = approvers.length;

          const status = getProposalStatus(proposalLogs);

          const tokenId = AccountId.fromSolidityAddress(token).toString();
          if (!tokenDataCache.has(tokenId)) {
            tokenDataCache.set(tokenId, DexService.fetchTokenData(tokenId));
          }
          const tokenData = await tokenDataCache.get(tokenId);

          return {
            nonce: BigNumber.from(nonce).toNumber(),
            amount: BigNumber.from(amount).toNumber(),
            transactionHash,
            type: ProposalType.TokenTransfer,
            approvalCount,
            approvers,
            event: ProposalEvent.Send,
            status,
            // TODO: Add real value for timestamp
            timestamp: "",
            tokenId,
            token: tokenData,
            receiver: AccountId.fromSolidityAddress(receiver).toString(),
            safeId: AccountId.fromSolidityAddress(to).toString(),
            operation,
            hexStringData,
            msgValue: BigNumber.from(value).toNumber(),
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
