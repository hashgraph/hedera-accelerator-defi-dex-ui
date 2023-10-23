import { useQuery } from "react-query";
import {
  DexService,
  convertEthersBigNumberToBigNumberJS,
  MirrorNodeTokenById,
  decodeLog,
  abiSignatures,
} from "@dex/services";
import daoSDK, { DAOEvents, MultiSigProposeTransactionType } from "@dao/services";
import { AllFilters, DAOQueries, Proposal, ProposalEvent, ProposalStatus, ProposalType } from "./types";
import { groupBy, isNil, isNotNil } from "ramda";
import { LogDescription } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { solidityAddressToAccountIdString, solidityAddressToTokenIdString } from "@shared/utils";
import { Contracts } from "@dex/services";

type UseDAOQueryKey = [DAOQueries.DAOs, DAOQueries.Proposals, string, string];

export function useDAOProposals(
  daoAccountId: string,
  safeEVMAddress: string,
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
    const filteredProposalEntries = proposalEntries.reduce(
      (acc, [transactionHash, proposalLogs]): [string, LogDescription[]][] => {
        if (proposalLogs === undefined) return acc;
        return [...acc, [transactionHash, proposalLogs]];
      },
      [] as [string, LogDescription[]][]
    );
    return filteredProposalEntries;
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
        const ownerId = solidityAddressToAccountIdString(args.owner);
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
      case MultiSigProposeTransactionType.GenericProposal:
        return ProposalType.GenericProposal;
      default:
        return ProposalType.TokenTransfer;
    }
  }

  return useQuery<Proposal[], Error, Proposal[], UseDAOQueryKey>(
    [DAOQueries.DAOs, DAOQueries.Proposals, daoAccountId, safeEVMAddress],
    async () => {
      const logs = await Promise.all([
        DexService.fetchMultiSigDAOLogs(daoAccountId),
        DexService.fetchHederaGnosisSafeLogs(safeEVMAddress),
      ]);
      const daoAndSafeLogs = logs ? logs.flat() : [];
      const groupedProposalEntries = groupLogsByTransactionHash(daoAndSafeLogs);
      const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();

      const getCurrentOwnerOfDAO = async () => {
        const logs = await DexService.fetchContractLogs(Contracts.MultiSigDAOFactory.ProxyId);
        const currentOwnerEvents =
          decodeLog(abiSignatures, logs, [DAOEvents.FeeConfigControllerChanged]).get(
            DAOEvents.FeeConfigControllerChanged
          ) ?? [];
        return (await DexService.fetchContractId(currentOwnerEvents[0].newController)).toString();
      };

      const getFeeConfigControllerUser = async () => {
        const logs = await DexService.fetchContractLogs(Contracts.SystemRoleBasedAccess.ProxyId);
        const currentOwnerEvents =
          decodeLog(abiSignatures, logs, [DAOEvents.UpdatedUsers]).get(DAOEvents.UpdatedUsers) ?? [];
        return solidityAddressToAccountIdString(currentOwnerEvents[0].users.feeConfigControllerUser);
      };
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
            metaData,
          } = proposalInfo;
          const { amount, receiver, token } = data ?? {};
          const threshold = await daoSDK.getThreshold(safeEVMAddress);
          const approvers = getApprovers(proposalLogs, transactionHash);
          const approvalCount = approvers.length;
          const isThresholdReached = approvalCount >= threshold;
          const proposalType = getProposalType(BigNumber.from(transactionType).toNumber());
          const isContractUpgradeProposal = proposalType === ProposalType.UpgradeContract;
          let isAdminApproved = false;
          let parsedData;
          if (isContractUpgradeProposal) {
            const upgradeProposalData = { ...data };
            const logs = await DexService.fetchContractLogs(upgradeProposalData.proxy);

            const allEvents = decodeLog(abiSignatures, logs, [DAOEvents.ChangeAdmin, DAOEvents.Upgraded]);
            const changeAdminLogs = allEvents.get(DAOEvents.ChangeAdmin) ?? [];
            const upgradedLogs = allEvents.get(DAOEvents.Upgraded) ?? [];

            const currentLogic = isNotNil(upgradedLogs[0])
              ? (await DexService.fetchContractId(upgradedLogs[0].implementation)).toString()
              : "";
            const latestAdminLog = isNotNil(changeAdminLogs[0]) ? changeAdminLogs[0] : "";
            const proxyAdmin = solidityAddressToAccountIdString(upgradeProposalData.proxyAdmin);
            const proxyLogic = (await DexService.fetchContractId(upgradeProposalData.proxyLogic)).toString();
            parsedData = { ...upgradeProposalData, proxyAdmin, proxyLogic, currentLogic };
            isAdminApproved = latestAdminLog?.newAdmin?.toLocaleLowerCase() === safeEVMAddress.toLocaleLowerCase();
          }
          const isGenericProposal = proposalType === ProposalType.GenericProposal;
          const feeConfigControllerUser = isGenericProposal ? await getFeeConfigControllerUser() : "";
          const currentOwner = isGenericProposal ? await getCurrentOwnerOfDAO() : "";
          const targetId = isGenericProposal ? (await DexService.fetchContractId(to)).toString() : "";
          const status = getProposalStatus(proposalLogs, isThresholdReached, proposalType, isAdminApproved);
          const tokenId = token ? solidityAddressToTokenIdString(token) : "";
          if (!!tokenId && !tokenDataCache.has(tokenId)) {
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
            /* TODO: Add real value for timestamp */
            timestamp: "",
            metadata: metaData,
            tokenId: tokenId,
            token: tokenData,
            receiver: receiver ? solidityAddressToAccountIdString(receiver) : "",
            safeEVMAddress,
            to,
            operation,
            hexStringData,
            data: isContractUpgradeProposal ? parsedData : { ...data },
            msgValue: value ? BigNumber.from(value).toNumber() : 0,
            title,
            author: creator ? solidityAddressToAccountIdString(creator) : "",
            description,
            link: linkToDiscussion,
            threshold,
            isContractUpgradeProposal,
            showTransferOwnerShip: isGenericProposal && isThresholdReached,
            currentOwner,
            targetId,
            feeConfigControllerUser,
          };
        })
      );

      return proposals;
    },
    {
      enabled: !!daoAccountId && !!safeEVMAddress,
      select: filterProposalsByStatus,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
