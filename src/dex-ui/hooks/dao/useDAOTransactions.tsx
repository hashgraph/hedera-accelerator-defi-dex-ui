import { useQuery } from "react-query";
import { DAOEvents, DexService, MirrorNodeTokenById } from "../../services";
import { DAOQueries } from "./types";
import { AccountId } from "@hashgraph/sdk";
import { groupBy, isNil } from "ramda";
import { LogDescription } from "ethers/lib/utils";
import { BigNumber } from "ethers";

export enum TransactionStatus {
  Success = "Success",
  Failed = "Failed",
  Pending = "Pending",
}

export enum TransactionEvent {
  Sent = "Sent",
  Received = "Received",
  Governance = "Governance",
  SafeCreated = "Safe Created",
}

export enum TransactionType {
  SendToken = "Send Token",
  AddNewMember = "Add New Member",
  RemoveMember = "Remove Member",
}

export interface Transaction {
  nonce: number;
  transactionHash: string;
  amount: number;
  type: TransactionType;
  name: string;
  approvalCount: number;
  approvers: string[];
  event: TransactionEvent;
  status: TransactionStatus;
  timestamp: string;
  tokenId: string;
  token: MirrorNodeTokenById | null | undefined;
  receiver: string;
  to: string;
  operation: number;
  hexData: string;
}

const AllFilters = [TransactionStatus.Success, TransactionStatus.Failed, TransactionStatus.Pending];
type UseDAOQueryKey = [DAOQueries.DAOs, DAOQueries.Transactions, string, string];

export function useDAOTransactions(
  daoAccountId: string,
  safeAccountId: string,
  transactionFilter: TransactionStatus[] = AllFilters
) {
  function filterTransactionsByStatus(transactions: Transaction[]): Transaction[] {
    return transactions.filter((transaction) => transactionFilter.includes(transaction.status));
  }

  const groupByTransactionHash = groupBy(function (log: LogDescription) {
    if (isNil(log?.args)) return "undefined";
    const { txHash, approvedHash, txnHash } = log.args;
    return txHash || approvedHash || txnHash;
  });

  function groupLogsByTransactionHash(logs: LogDescription[]): [string, LogDescription[]][] {
    const logsGroupedByTransactionHash = groupByTransactionHash(logs);
    delete logsGroupedByTransactionHash["undefined"];
    const transactionEntries = Object.entries(logsGroupedByTransactionHash);
    return transactionEntries;
  }

  return useQuery<Transaction[], Error, Transaction[], UseDAOQueryKey>(
    [DAOQueries.DAOs, DAOQueries.Transactions, daoAccountId, safeAccountId],
    async () => {
      const logs = await Promise.all([
        DexService.fetchMultiSigDAOLogs(daoAccountId),
        DexService.fetchHederaGnosisSafeLogs(safeAccountId),
      ]);
      const daoAndSafeLogs = logs.flat();
      const groupedTransactionEntries = groupLogsByTransactionHash(daoAndSafeLogs);
      const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();

      const transactions: Transaction[] = await Promise.all(
        groupedTransactionEntries.map(async ([transactionHash, transactionLogs]) => {
          const transactionInfo = transactionLogs.find((log) => log.name === DAOEvents.TransactionCreated)?.args.info;
          const { nonce, to, value, data, operation, hexData } = transactionInfo;
          const { amount, receiver, token } = data;
          const name = BigNumber.from(value).toString();

          const approvers = transactionLogs
            .filter((log) => log.name === DAOEvents.ApproveHash)
            .map((log) => AccountId.fromSolidityAddress(log?.args.owner).toString());

          const approvalCount = approvers.length;

          const status = transactionLogs.find((log) => log.name === DAOEvents.ExecutionSuccess)
            ? TransactionStatus.Success
            : transactionLogs.find((log) => log.name === DAOEvents.ExecutionFailure)
            ? TransactionStatus.Failed
            : TransactionStatus.Pending;
          const tokenId = AccountId.fromSolidityAddress(token).toString();

          if (!tokenDataCache.has(tokenId)) {
            tokenDataCache.set(tokenId, DexService.fetchTokenData(tokenId));
          }
          const tokenData = await tokenDataCache.get(tokenId);

          return {
            nonce: BigNumber.from(nonce).toNumber(),
            amount: BigNumber.from(amount).toNumber(),
            transactionHash,
            type: TransactionType.SendToken,
            // TODO: Add real value for name
            name,
            approvalCount,
            approvers,
            event: TransactionEvent.Sent,
            status: status,
            // TODO: Add real value for timestamp
            timestamp: "",
            tokenId,
            token: tokenData,
            receiver: AccountId.fromSolidityAddress(receiver).toString(),
            to: AccountId.fromSolidityAddress(to).toString(),
            operation,
            hexData,
          };
        })
      );

      return transactions;
    },
    {
      enabled: !!daoAccountId && !!safeAccountId,
      select: filterTransactionsByStatus,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
