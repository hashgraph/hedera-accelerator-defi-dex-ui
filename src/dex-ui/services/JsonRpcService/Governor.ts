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

/**
 * Fetches the current state of a governor proposal.
 * @param governorAccountId - The account id of the governor contract.
 * @param proposalId - The id of the governor proposal.
 * @returns The state of the proposal
 */
async function fetchProposalState(governorAccountId: string, proposalId: string): Promise<BigNumber> {
  const preciseProposalId = ethers.BigNumber.from(proposalId);
  const governorContract = createGovernorContract(governorAccountId);
  const proposalState: ethers.BigNumber = await governorContract.state(preciseProposalId);
  return convertEthersBigNumberToBigNumberJS(proposalState);
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

interface ProposalVotes {
  againstVotes: BigNumber;
  forVotes: BigNumber;
  abstainVotes: BigNumber;
}

/**
 * TODO
 * @param contractId -
 * @param proposalId -
 * @returns
 */
async function fetchProposalVotes(governorAccountId: string, proposalId: string): Promise<ProposalVotes> {
  const preciseProposalId = ethers.BigNumber.from(proposalId);
  const governorContract = createGovernorContract(governorAccountId);
  const results: ethers.BigNumber[] = await governorContract.proposalVotes(preciseProposalId);
  const [againstVotes, forVotes, abstainVotes]: BigNumber[] = results.map(convertEthersBigNumberToBigNumberJS);
  return { againstVotes, forVotes, abstainVotes };
}

/**
 * TODO
 * @param contractId -
 * @param blockNumber -
 * @returns
 */
async function fetchQuorum(governorAccountId: string, blockNumber: string): Promise<BigNumber> {
  const preciseBlockNumber = ethers.BigNumber.from(blockNumber);
  const governorContract = createGovernorContract(governorAccountId);
  const quorum: ethers.BigNumber = await governorContract.quorum(preciseBlockNumber);
  return convertEthersBigNumberToBigNumberJS(quorum);
}

const GovernorContract = { fetchProposalState, fetchHasVoted, fetchProposalVotes, fetchQuorum };
export default GovernorContract;
export type { ProposalVotes };
