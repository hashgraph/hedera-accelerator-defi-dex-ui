import { BigNumber } from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";
import { DexService, GovernanceTokenId, MirrorNodeDecodedProposalEvent } from "..";
import { ContractProposalState, Proposal, ProposalState, ProposalType } from "../../store/governanceSlice";
import { ProposalVotes } from "../JsonRpcService/Governor";
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
  interface ProposalEventDetails {
    state: BigNumber | undefined;
    votes: ProposalVotes;
    quorum: BigNumber | undefined;
  }

  type ProposalEventsWithDetails = MirrorNodeDecodedProposalEvent & ProposalEventDetails;

  const convertEventToProposal = (
    proposalEvent: ProposalEventsWithDetails,
    totalGodTokenSupply: Long | null
  ): Proposal => {
    const proposalState = proposalEvent.state
      ? (ContractProposalState[proposalEvent.state?.toNumber()] as keyof typeof ContractProposalState)
      : undefined;
    const isProposalTypeValid = Object.values(ProposalType).includes(proposalEvent.type as ProposalType);
    return {
      id: proposalEvent.proposalId,
      contractId: proposalEvent.contractId,
      type: isProposalTypeValid ? (proposalEvent.type as ProposalType) : undefined,
      title: proposalEvent.title,
      description: proposalEvent.description ?? "",
      link: proposalEvent.link ?? "",
      author: proposalEvent.proposer
        ? AccountId.fromSolidityAddress(proposalEvent.proposer)
        : AccountId.fromString("0.0.34728121"),
      status: proposalState ? getStatus(ProposalState[proposalState]) : undefined,
      timeRemaining:
        !isNil(proposalEvent.startBlock) && !isNil(proposalEvent.endBlock)
          ? getTimeRemaining(proposalEvent.startBlock, proposalEvent.endBlock)
          : undefined,
      state: proposalState ? ProposalState[proposalState as keyof typeof ProposalState] : undefined,
      timestamp: proposalEvent.timestamp,
      votes: {
        yes: proposalEvent.votes?.forVotes,
        no: proposalEvent.votes?.againstVotes,
        abstain: proposalEvent.votes?.abstainVotes,
        quorum: proposalEvent.quorum,
        max: !isNil(totalGodTokenSupply) ? new BigNumber(totalGodTokenSupply.toString()) : BigNumber(0),
      },
    };
  };

  const fetchProposalDetails = async (
    proposalEvent: MirrorNodeDecodedProposalEvent
  ): Promise<ProposalEventsWithDetails> => {
    const { proposalId, contractId, endBlock } = proposalEvent;
    const stateResult = DexService.fetchProposalState(contractId, proposalId);
    const votesResult = DexService.fetchProposalVotes(contractId, proposalId);
    const quorumResult = endBlock ? DexService.fetchQuorum(contractId, endBlock) : undefined;
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
    const proposalEvents = await DexService.fetchAllProposalEvents();
    const proposalEventsWithDetails = await fetchAllProposalDetails(proposalEvents);
    const totalGodTokenSupply = await DexService.fetchTokenData(GovernanceTokenId);
    const proposals = proposalEventsWithDetails.map((event) => {
      return convertEventToProposal(event, totalGodTokenSupply.data.total_supply);
    });
    return proposals;
  };

  return {
    fetchAllProposals,
  };
}

export { createDexService };
export type { DexServiceType };
