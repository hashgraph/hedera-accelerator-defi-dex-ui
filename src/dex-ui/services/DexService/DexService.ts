import { BigNumber } from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";
import { HederaService, MirrorNodeDecodedProposalEvent, MirrorNodeService } from "..";
import { ContractProposalState, Proposal, ProposalState, ProposalType } from "../../store/governanceSlice";
import { ProposalVotes } from "../HederaService/GovernorService";
import { isNil } from "ramda";
import { getStatus } from "../../store/governanceSlice/utils";

type DexServiceType = ReturnType<typeof createDexService>;

const TOTAL_GOD_TOKEN_SUPPLY = BigNumber(100);

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
  interface ProposalEventDetails {
    state: BigNumber | undefined;
    votes: ProposalVotes;
    quorum: BigNumber | undefined;
  }
  type ProposalEventsWithDetails = MirrorNodeDecodedProposalEvent & ProposalEventDetails;

  const convertEventToProposal = (proposalEvent: ProposalEventsWithDetails): Proposal => {
    const { proposalId, contractId, type, description, proposer, startBlock, endBlock, state, votes, quorum } =
      proposalEvent;
    const proposalState = state
      ? (ContractProposalState[state?.toNumber()] as keyof typeof ContractProposalState)
      : undefined;
    const isProposalTypeValid = Object.values(ProposalType).includes(type as ProposalType);
    return {
      id: proposalId,
      contractId,
      type: isProposalTypeValid ? (type as ProposalType) : undefined,
      title: description,
      description: `Preview of the description lorem ipsum dolor sit amit consectetur 
              adipiscing elit Phasellus congue, sapien eu...`,
      author: proposer ? AccountId.fromSolidityAddress(proposer) : AccountId.fromString("0.0.34728121"),
      status: proposalState ? getStatus(ProposalState[proposalState]) : undefined,
      timeRemaining: !isNil(startBlock) && !isNil(endBlock) ? getTimeRemaining(startBlock, endBlock) : undefined,
      state: proposalState ? ProposalState[proposalState as keyof typeof ProposalState] : undefined,
      votes: {
        yes: votes.forVotes,
        no: votes.againstVotes,
        abstain: votes.abstainVotes,
        quorum,
        max: TOTAL_GOD_TOKEN_SUPPLY,
      },
    };
  };

  const fetchProposalDetails = async (
    proposalEvent: MirrorNodeDecodedProposalEvent
  ): Promise<ProposalEventsWithDetails> => {
    const { proposalId, contractId, endBlock } = proposalEvent;
    const stateResult = HederaService.fetchProposalState(contractId, proposalId);
    const votesResult = HederaService.fetchProposalVotes(contractId, proposalId);
    const quorumResult = endBlock ? HederaService.fetchQuorum(contractId, endBlock) : undefined;
    const eventDetailsResults = await Promise.allSettled([stateResult, votesResult, quorumResult]);
    const [state, votes, quorum] = eventDetailsResults.map<any>((event: PromiseSettledResult<any>) => {
      return event.status === "fulfilled" ? event.value : undefined;
    });
    return { ...proposalEvent, state, votes, quorum };
  };

  const fetchAllProposalDetails = async (
    proposalEvents: MirrorNodeDecodedProposalEvent[]
  ): Promise<ProposalEventsWithDetails[]> => {
    const proposalEventsWithDetailsResults = await Promise.allSettled(proposalEvents.map(fetchProposalDetails));
    const proposalEventsWithDetails = proposalEventsWithDetailsResults.map((event: PromiseSettledResult<any>) => {
      return event.status === "fulfilled" ? event.value : undefined;
    });
    return proposalEventsWithDetails;
  };

  const fetchAllProposals = async (): Promise<Proposal[]> => {
    const proposalEvents = await MirrorNodeService.fetchAllProposalEvents();
    const proposalEventsWithDetails = await fetchAllProposalDetails(proposalEvents);
    const proposals = proposalEventsWithDetails.map(convertEventToProposal);
    return proposals;
  };

  return { fetchAllProposals };
}

export { createDexService };
export type { DexServiceType };
