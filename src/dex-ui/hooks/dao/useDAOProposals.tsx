import { useQuery } from "react-query";
import {
  convertEthersBigNumberToBigNumberJS,
  DAOEvents,
  DAOType,
  DexService,
  DEX_TOKEN_PRECISION_VALUE,
  MirrorNodeTokenById,
} from "@services";
import { DAOQueries } from "./types";
import { AccountId } from "@hashgraph/sdk";
import { groupBy, isNil } from "ramda";
import { LogDescription } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import { ProposalData } from "@services/DexService/governance/type";
import { ContractProposalState, ProposalState } from "@store/governanceSlice";
import { getTimeRemaining } from "@utils";

export enum ProposalStatus {
  Pending = "Active",
  Queued = "Queued",
  Success = "Passed",
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
  AddNewMember = "Add Member",
  RemoveMember = "Remove Member",
  ReplaceMember = "Replace Member",
  ChangeThreshold = "Upgrade Threshold",
}

interface Votes {
  yes: number | undefined;
  no: number | undefined;
  abstain: number | undefined;
  quorum: number | undefined;
  remaining: number | undefined;
  max: number | undefined;
}

export interface Proposal {
  nonce: number;
  transactionHash?: string;
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
  title: string;
  author: string;
  description: string;
  link: string | undefined;
  threshold: number | undefined;
  proposalId?: string;
  timeRemaining?: string;
  votes?: Votes;
}

const AllFilters = [ProposalStatus.Success, ProposalStatus.Failed, ProposalStatus.Pending];
type UseDAOQueryKey = [DAOQueries.DAOs, DAOQueries.Proposals, string, string];

export function useDAOProposals(
  daoAccountId: string,
  daoType: DAOType,
  safeAccountId: string,
  proposalFilter: ProposalStatus[] = AllFilters,
  governanceAddress = "",
  daoTokenId = ""
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

  const getVotes = (proposalData: ProposalData, godTokenData: MirrorNodeTokenById | null | undefined): Votes => {
    const totalGodTokenSupply = godTokenData?.data?.total_supply;
    const precisionValue = godTokenData?.data.decimals ? +godTokenData?.data.decimals : DEX_TOKEN_PRECISION_VALUE;
    const yes = Number(proposalData?.forVotes.shiftedBy(-precisionValue).toFixed(3));
    const no = Number(proposalData?.againstVotes.shiftedBy(-precisionValue).toFixed(3));
    const abstain = Number(proposalData?.abstainVotes.shiftedBy(-precisionValue).toFixed(3));
    const max = !isNil(totalGodTokenSupply) ? BigNumber.from(totalGodTokenSupply.toString()) : BigNumber.from(0);
    const totalVotes = yes + no + abstain;
    const remaining = Number(
      convertEthersBigNumberToBigNumberJS(max).minus(totalVotes).shiftedBy(-precisionValue).toNumber().toFixed(3)
    );
    const quorum = Number(
      proposalData.quorum
        ?.div(convertEthersBigNumberToBigNumberJS(max ?? BigNumber.from(1)))
        .multipliedBy(convertEthersBigNumberToBigNumberJS(BigNumber.from(100)))
        .toFixed(3)
    );
    return {
      yes,
      no,
      abstain,
      quorum,
      remaining,
      max: convertEthersBigNumberToBigNumberJS(max).shiftedBy(-precisionValue).toNumber(),
    };
  };

  const convertDataToProposal = (
    proposalData: ProposalData,
    godTokenData: MirrorNodeTokenById | null | undefined,
    tokenData: MirrorNodeTokenById | null | undefined
  ): Proposal => {
    const proposalState = proposalData.state
      ? (ContractProposalState[proposalData.state] as keyof typeof ContractProposalState)
      : (ContractProposalState[0] as keyof typeof ContractProposalState);
    return {
      timeRemaining:
        !isNil(proposalData.startBlock) && !isNil(proposalData.endBlock)
          ? getTimeRemaining(proposalData.startBlock, proposalData.endBlock).toString()
          : undefined,

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
      safeId: "",
      operation: 0,
      hexStringData: proposalData.data ?? "",
      msgValue: 0,
      title: proposalData.title,
      author: proposalData.proposer ? AccountId.fromSolidityAddress(proposalData.proposer).toString() : "",
      description: proposalData.description,
      link: proposalData.link,
      threshold: 0,
      votes: getVotes(proposalData, godTokenData),
    };
  };

  return useQuery<Proposal[], Error, Proposal[], UseDAOQueryKey>(
    [DAOQueries.DAOs, DAOQueries.Proposals, daoAccountId, safeAccountId],
    async () => {
      let logs;
      if (daoType === DAOType.MultiSig) {
        logs = await Promise.all([
          DexService.fetchMultiSigDAOLogs(daoAccountId),
          DexService.fetchHederaGnosisSafeLogs(safeAccountId),
        ]);
        const daoAndSafeLogs = logs ? logs.flat() : [];
        const groupedProposalEntries = groupLogsByTransactionHash(daoAndSafeLogs);
        const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();
        const proposals: Proposal[] = await Promise.all(
          groupedProposalEntries.map(async ([transactionHash, proposalLogs]) => {
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
            const approvers = getApprovers(proposalLogs);
            const approvalCount = approvers.length;

            const status = getProposalStatus(proposalLogs);
            const proposalType = getProposalType(BigNumber.from(transactionType).toNumber());
            const tokenId = token ? AccountId.fromSolidityAddress(token).toString() : "";
            if (!tokenDataCache.has(tokenId)) {
              tokenDataCache.set(tokenId, DexService.fetchTokenData(tokenId));
            }
            const tokenData = await tokenDataCache.get(tokenId);
            return {
              nonce: nonce ? BigNumber.from(nonce).toNumber() : 0,
              amount: amount
                ? convertEthersBigNumberToBigNumberJS(amount).shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber()
                : 0,
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
              threshold: _threshold ? BigNumber.from(_threshold).toNumber() : 0,
            };
          })
        );
        return proposals;
      } else if (daoType === DAOType.GovernanceToken) {
        const data = await Promise.all([
          DexService.fetchGovernanceDAOLogs(governanceAddress),
          DexService.fetchTokenData(daoTokenId),
        ]);
        const tokenDataCache = new Map<string, Promise<MirrorNodeTokenById | null>>();
        const proposals = await Promise.all(
          data[0].map(async (proposal) => {
            const tokenId = proposal.tokenToTransfer;
            let tokenData;
            if (tokenId) {
              if (!tokenDataCache.has(tokenId)) {
                tokenDataCache.set(tokenId, DexService.fetchTokenData(tokenId));
              }
              tokenData = await tokenDataCache.get(tokenId);
            }
            return convertDataToProposal(proposal, data[1], tokenData);
          })
        );
        return proposals;
      } else if (daoType === DAOType.NFT) {
        logs = await Promise.all([DexService.fetchNFTDAOLogs(daoAccountId)]);
        return [];
      }
      return [];
    },
    {
      enabled: !!daoAccountId,
      select: filterProposalsByStatus,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
