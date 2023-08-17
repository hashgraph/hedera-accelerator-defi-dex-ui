import { useQuery } from "react-query";
import {
  DexService,
  convertEthersBigNumberToBigNumberJS,
  MirrorNodeTokenById,
  decodeLog,
  abiSignatures,
} from "@dex/services";
import { DAOEvents, getThreshold, MultiSigProposeTransactionType } from "@dao/services";
import { AllFilters, DAOQueries, Proposal, ProposalEvent, ProposalStatus, ProposalType } from "./types";
import { AccountId } from "@hashgraph/sdk";
import { groupBy, isNil, isNotNil } from "ramda";
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

  function getProposalType(transactionType: number): ProposalType {
    switch (transactionType) {
      case MultiSigProposeTransactionType.TokenTransfer:
      case MultiSigProposeTransactionType.HBARTokenTransfer:
        return ProposalType.TokenTransfer;
      case MultiSigProposeTransactionType.AddMember:
        return ProposalType.AddNewMember;
      case MultiSigProposeTransactionType.DeleteMember:
        return ProposalType.RemoveMember;
      case MultiSigProposeTransactionType.ReplaceMember:
        return ProposalType.ReplaceMember;
      case MultiSigProposeTransactionType.ChangeThreshold:
        return ProposalType.ChangeThreshold;
      case MultiSigProposeTransactionType.TokenAssociation:
        return ProposalType.TokenAssociate;
      case MultiSigProposeTransactionType.TypeSetText:
        return ProposalType.TextProposal;
      case MultiSigProposeTransactionType.UpgradeProxy:
        return ProposalType.UpgradeContract;
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
          const { amount, receiver, token, _threshold } = data ?? {};
          const threshold = getThreshold(daoAndSafeLogs, BigNumber.from(_threshold ?? 0));
          const approvers = getApprovers(proposalLogs, transactionHash);
          const approvalCount = approvers.length;
          const isThresholdReached = approvalCount >= threshold;
          const proposalType = getProposalType(BigNumber.from(transactionType).toNumber());
          /** TODO: For DAO Upgrade extra step is introduced to check for Admin Approval */
          const isContractUpgradeProposal = proposalType === ProposalType.UpgradeContract;
          let isAdminApproved = false;
          let parsedData;
          if (isContractUpgradeProposal) {
            const safeEVMAddress = await DexService.fetchContractEVMAddress(safeAccountId);
            const upgradeProposalData = { ...data };
            const logs = await DexService.fetchContractLogs(upgradeProposalData.proxy);

            const allEvents = decodeLog(abiSignatures, logs, [DAOEvents.ChangeAdmin, DAOEvents.Upgraded]);
            const changeAdminLogs = allEvents.get(DAOEvents.ChangeAdmin) ?? [];
            const upgradedLogs = allEvents.get(DAOEvents.Upgraded) ?? [];

            const currentLogic = isNotNil(upgradedLogs[0])
              ? (await DexService.fetchContractId(upgradedLogs[0].implementation)).toString()
              : "";
            const latestAdminLog = isNotNil(changeAdminLogs[0]) ? changeAdminLogs[0] : "";
            const proxyAdmin = AccountId.fromSolidityAddress(upgradeProposalData.proxyAdmin).toString();
            const proxyLogic = (await DexService.fetchContractId(upgradeProposalData.proxyLogic)).toString();
            parsedData = { ...upgradeProposalData, proxyAdmin, proxyLogic, currentLogic };
            isAdminApproved = latestAdminLog?.newAdmin?.toLocaleLowerCase() === safeEVMAddress.toLocaleLowerCase();
          }
          const status = getProposalStatus(proposalLogs, isThresholdReached, proposalType, isAdminApproved);
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
            safeAccountId,
            to,
            operation,
            hexStringData,
            data: isContractUpgradeProposal ? parsedData : { ...data },
            msgValue: value ? BigNumber.from(value).toNumber() : 0,
            title: title,
            author: creator ? AccountId.fromSolidityAddress(creator).toString() : "",
            description: description,
            link: linkToDiscussion,
            threshold,
            /**TODO Remove the logic from here once extra step for ContractUpgrade is Not required */
            isContractUpgradeProposal,
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
