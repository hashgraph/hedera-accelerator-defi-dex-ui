import { BigNumber } from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";
import { DexService, GovernanceTokenId, MirrorNodeDecodedProposalEvent } from "..";
import { ContractProposalState, Proposal, ProposalState, ProposalType } from "../../store/governanceSlice";
import { ProposalDetailsResponse } from "../JsonRpcService/Governor";
import { isNil } from "ramda";
import { getStatus } from "../../store/governanceSlice/utils";

type DexServiceType = ReturnType<typeof createDexService>;

const getTimeRemaining = (startBlock: string, endBlock: string): BigNumber => {
  /** Each Blocktime is about 12 secs long */
  const duration = BigNumber(endBlock).minus(BigNumber(startBlock)).times(12);
  return duration;
};

/**
 * General format of service calls:
 * 1 - Convert data types.
 * 2 - Create contract parameters.
 * 3 - Create and sign transaction.
 * 4 - Send transaction to wallet and execute transaction.
 * 5 - Extract and return resulting data.
 */

/**
 * TODO: A single source for all service functions. Wrap in React Query hook for easy access.
 * @returns
 */
function createDexService() {
  type ProposalData = MirrorNodeDecodedProposalEvent & ProposalDetailsResponse;

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
        const proposalDetails = await DexService.fetchProposalDetails(
          proposalEvent.contractId,
          proposalEvent.proposalId
        );
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

  const fetchAllProposals = async (): Promise<Proposal[]> => {
    const proposalEvents = await DexService.fetchAllProposalEvents();
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

  async function fetchProposal(id: string): Promise<Proposal> {
    const proposalEvents = await DexService.fetchAllProposalEvents();
    const proposalEvent = proposalEvents.find(
      (proposalEvent) => proposalEvent.proposalId === id
    ) as MirrorNodeDecodedProposalEvent;
    const proposalDetails = await fetchProposalDetails(proposalEvent);
    const totalGodTokenSupply = await DexService.fetchTokenData(GovernanceTokenId);
    const proposal = convertDataToProposal(proposalDetails, totalGodTokenSupply.data.total_supply);
    return proposal;
  }

  return {
    fetchProposal,
    fetchAllProposals,
  };
}

export { createDexService };
export type { DexServiceType };
