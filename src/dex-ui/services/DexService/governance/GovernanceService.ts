import { BigNumber } from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";
import { isNil } from "ramda";
import { DexService } from "../..";
import {
  ContractProposalState,
  Proposal,
  ProposalState,
  ProposalType,
  ProposalStatus,
} from "../../../store/governanceSlice";
import { getTimeRemaining } from "@utils";
import { MirrorNodeDecodedProposalEvent } from "../../MirrorNodeService";
import { getFulfilledResultsData } from "../../MirrorNodeService/utils";
import { Contracts, GovernanceTokenId } from "../../constants";
import { ProposalData } from "./type";

/**
 * Converts a proposal state into a corresponding status.
 * @param state - A proposal state.
 * @returns The corresponding proposal status.
 */
const getStatus = (state: ProposalState): ProposalStatus | undefined => {
  if (state === ProposalState.Active || state === ProposalState.Pending) {
    return ProposalStatus.Active;
  }
  if (state === ProposalState.Queued || state === ProposalState.Succeeded || state === ProposalState.Executed) {
    return ProposalStatus.Passed;
  }
  if (state === ProposalState.Canceled || state === ProposalState.Defeated || state === ProposalState.Expired) {
    return ProposalStatus.Failed;
  }
  return undefined;
};
/**
 * Fetches all proposal events emitted by a smart contract. The "ProposalCreated",
 * "ProposalExecuted", and "ProposalCanceled" are fetched. These events provide data
 * regarding the contract proposals.
 * @param contractId - The id of the contract to fetch events from.
 * @returns An array of proposal event data.
 */
export const fetchAllProposalEvents = async (): Promise<MirrorNodeDecodedProposalEvent[]> => {
  const tokenTransferEventsResults = DexService.fetchContractProposalEvents(
    ProposalType.TokenTransfer,
    Contracts.Governor.TransferToken.ProxyId
  );
  const createTokenEventsResults = DexService.fetchContractProposalEvents(
    ProposalType.CreateToken,
    Contracts.Governor.CreateToken.ProxyId
  );
  const textProposalEventsResults = DexService.fetchContractProposalEvents(
    ProposalType.Text,
    Contracts.Governor.TextProposal.ProxyId
  );
  const contractUpgradeEventsResults = DexService.fetchContractProposalEvents(
    ProposalType.ContractUpgrade,
    Contracts.Governor.ContractUpgrade.ProxyId
  );
  const proposalEventsResults = await Promise.allSettled([
    tokenTransferEventsResults,
    createTokenEventsResults,
    textProposalEventsResults,
    contractUpgradeEventsResults,
  ]);
  const proposalEvents = getFulfilledResultsData<MirrorNodeDecodedProposalEvent>(proposalEventsResults);
  return proposalEvents;
};

const convertDataToProposal = (proposalData: ProposalData, totalGodTokenSupply: Long | null): Proposal => {
  const proposalState = proposalData.state
    ? (ContractProposalState[proposalData.state] as keyof typeof ContractProposalState)
    : undefined;
  const isProposalTypeValid = Object.values(ProposalType).includes(proposalData.type as ProposalType);
  return {
    id: proposalData.proposalId,
    contractId: proposalData.contractId,
    type: isProposalTypeValid ? (proposalData.type as ProposalType) : undefined,
    title: proposalData.title,
    description: proposalData.description ?? "",
    link: proposalData.link ?? "",
    author: proposalData.proposer
      ? AccountId.fromSolidityAddress(proposalData.proposer)
      : AccountId.fromString("0.0.34728121"),
    status: proposalState ? getStatus(ProposalState[proposalState]) : undefined,
    timeRemaining:
      !isNil(proposalData.startBlock) && !isNil(proposalData.endBlock)
        ? getTimeRemaining(proposalData.startBlock, proposalData.endBlock)
        : undefined,
    state: proposalState ? ProposalState[proposalState as keyof typeof ProposalState] : undefined,
    timestamp: proposalData.timestamp,
    votes: {
      yes: proposalData?.forVotes,
      no: proposalData?.againstVotes,
      abstain: proposalData?.abstainVotes,
      quorum: proposalData.quorum,
      max: !isNil(totalGodTokenSupply) ? new BigNumber(totalGodTokenSupply.toString()) : BigNumber(0),
    },
  };
};

const fetchAllProposalData = async (proposalEvents: MirrorNodeDecodedProposalEvent[]): Promise<ProposalData[]> => {
  const proposalEventsWithDetailsResults = await Promise.allSettled(
    proposalEvents.map(async (proposalEvent: MirrorNodeDecodedProposalEvent) => {
      const proposalDetails = await DexService.fetchProposalDetails(proposalEvent.contractId, proposalEvent.proposalId);
      /**
       * proposalDetails contain the latest proposal state. Therefore, the common fields derived from
       * proposalDetails should override the same field found in the proposalEvent.
       */
      return { ...proposalEvent, ...proposalDetails };
    })
  );
  const proposalEventsWithDetails = proposalEventsWithDetailsResults.map((event: PromiseSettledResult<any>) => {
    return event.status === "fulfilled" ? event.value : undefined;
  });
  return proposalEventsWithDetails;
};

export const fetchAllProposals = async (): Promise<Proposal[]> => {
  const proposalEvents = await fetchAllProposalEvents();
  const proposalDetails = await fetchAllProposalData(proposalEvents);
  const totalGodTokenSupply = await DexService.fetchTokenData(GovernanceTokenId);
  const proposals = proposalDetails.map((proposalData) => {
    return convertDataToProposal(proposalData, totalGodTokenSupply.data.total_supply);
  });
  return proposals;
};

async function fetchProposalDetails(proposalEvent: MirrorNodeDecodedProposalEvent) {
  const proposalDetails = await DexService.fetchProposalDetails(proposalEvent.contractId, proposalEvent.proposalId);
  /**
   * proposalDetails contain the latest proposal state. Therefore, the common fields derived from
   * proposalDetails should override the same field found in the proposalEvent.
   */
  return { ...proposalEvent, ...proposalDetails };
}

export async function fetchProposal(id: string): Promise<Proposal> {
  const proposalEvents = await fetchAllProposalEvents();
  const proposalEvent = proposalEvents.find(
    (proposalEvent) => proposalEvent.proposalId === id
  ) as MirrorNodeDecodedProposalEvent;
  const proposalDetails = await fetchProposalDetails(proposalEvent);
  const totalGodTokenSupply = await DexService.fetchTokenData(GovernanceTokenId);
  const proposal = convertDataToProposal(proposalDetails, totalGodTokenSupply.data.total_supply);
  return proposal;
}
