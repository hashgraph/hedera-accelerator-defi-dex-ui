import { ethers } from "ethers";
import { createContract, convertEthersBigNumberToBigNumberJS } from "./utils";
import Governor from "../abi/GovernorCountingSimpleInternal.json";
import BigNumber from "bignumber.js";
import { AccountId } from "@hashgraph/sdk";

/**
 * Creates an ethers.Contract representation of the Governor contract.
 * @param governorAccountId - The Governor contract account id.
 * @returns An ethers.Contract representation of the Governor contract
 */
function createGovernorContract(governorAccountId: string): ethers.Contract {
  return createContract(governorAccountId, Governor.abi);
}

interface FetchHasVotedParams {
  governorAccountId: string;
  proposalId: string;
  accountId: string;
}

/**
 * Returns true if an account id has voted on the specified proposal.
 * @param params - {@link FetchHasVotedParams}
 * @returns true if the account has voted on the proposal.
 */
async function fetchHasVoted(params: FetchHasVotedParams): Promise<boolean> {
  const { governorAccountId, proposalId, accountId } = params;
  const preciseProposalId = ethers.BigNumber.from(proposalId);
  const accountAddress = AccountId.fromString(accountId).toSolidityAddress();
  const governorContract = createGovernorContract(governorAccountId);
  const hasVoted: boolean = await governorContract.hasVoted(preciseProposalId, accountAddress);
  return hasVoted;
}

type RawProposalDetailsResponse = [
  quorumValue: ethers.BigNumber,
  isQuorumReached: boolean,
  proposalState: number,
  voted: boolean,
  againstVotes: ethers.BigNumber,
  forVotes: ethers.BigNumber,
  abstainVotes: ethers.BigNumber,
  creator: string,
  title: string,
  description: string,
  link: string
];

type Duration = {
  startBlock: string;
  endBlock: string;
};

type VotingInformation = {
  abstainVotes: BigNumber;
  againstVotes: BigNumber;
  forVotes: BigNumber;
  isQuorumReached: boolean;
  proposalState: number;
  quorumValue: BigNumber;
  voted: boolean;
  votedUser: string;
};

type ProposalDetailsResponse = {
  quorum: BigNumber;
  isQuorumReached: boolean;
  state: number;
  hasVoted: boolean;
  againstVotes: BigNumber;
  forVotes: BigNumber;
  abstainVotes: BigNumber;
  creator: string;
  title: string;
  description: string;
  link: string;
  transferFromAccount?: string | undefined;
  transferToAccount?: string | undefined;
  tokenToTransfer?: string | undefined;
  transferTokenAmount?: number | undefined;
  votingInformation?: VotingInformation;
  duration?: Duration;
};

async function fetchProposalDetails(governorAccountId: string, proposalId: string): Promise<ProposalDetailsResponse> {
  const preciseProposalId = ethers.BigNumber.from(proposalId);
  const governorContract = createGovernorContract(governorAccountId);
  const proposalDetails: RawProposalDetailsResponse = await governorContract.getProposalDetails(preciseProposalId);
  const [
    quorumValue,
    isQuorumReached,
    proposalState,
    voted,
    againstVotes,
    forVotes,
    abstainVotes,
    creator,
    title,
    description,
    link,
  ] = proposalDetails;
  return {
    quorum: convertEthersBigNumberToBigNumberJS(quorumValue),
    isQuorumReached,
    state: proposalState,
    hasVoted: voted,
    againstVotes: convertEthersBigNumberToBigNumberJS(againstVotes),
    forVotes: convertEthersBigNumberToBigNumberJS(forVotes),
    abstainVotes: convertEthersBigNumberToBigNumberJS(abstainVotes),
    creator,
    title,
    description,
    link,
  };
}

const GovernorContract = { fetchProposalDetails, fetchHasVoted };
export default GovernorContract;
export type { ProposalDetailsResponse };
