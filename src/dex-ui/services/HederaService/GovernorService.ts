import { BigNumber } from "bignumber.js";
import { AccountId, ContractExecuteTransaction, ContractFunctionParameters, TransactionResponse } from "@hashgraph/sdk";
import { ContractId } from "@hashgraph/sdk";
import { GovernorProxyContracts, TOKEN_USER_ID } from "../constants";
import { GovernorContractFunctions } from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { queryContract } from "./utils";

/**
 * General format of service calls:
 * 1 - Convert data types.
 * 2 - Create contract parameters.
 * 3 - Create and sign transaction.
 * 4 - Send transaction to wallet and execute transaction.
 * 5 - Extract and return resulting data.
 */

/**
 * Fetches the current state of a governor proposal.
 * @param contractId - The account id of the governor contract.
 * @param proposalId - The id of the governor proposal.
 * @returns The state of the proposal
 */
const fetchProposalState = async (contractId: string, proposalId: string): Promise<BigNumber | undefined> => {
  const governorContractId = ContractId.fromString(contractId);
  const preciseProposalId = BigNumber(proposalId);
  const queryParams = new ContractFunctionParameters().addUint256(preciseProposalId);
  const result = await queryContract(governorContractId, GovernorContractFunctions.GetState, queryParams);
  const proposalState = result?.getUint256(0);
  return proposalState;
};

/**
 * TODO
 * @param contractId -
 * @param blockNumber -
 * @returns
 */
const fetchQuorum = async (contractId: string, blockNumber: string): Promise<BigNumber | undefined> => {
  const governorContractId = ContractId.fromString(contractId);
  const preciseBlockNumber = BigNumber(blockNumber);
  const queryParams = new ContractFunctionParameters().addUint256(preciseBlockNumber);
  const result = await queryContract(governorContractId, GovernorContractFunctions.GetQuorum, queryParams);
  const quorum = result?.getInt256(0);
  return quorum;
};
interface ProposalVotes {
  againstVotes: BigNumber | undefined;
  forVotes: BigNumber | undefined;
  abstainVotes: BigNumber | undefined;
}

/**
 * TODO
 * @param contractId -
 * @param proposalId -
 * @returns
 */
const fetchProposalVotes = async (contractId: string, proposalId: string): Promise<ProposalVotes> => {
  const governorContractId = ContractId.fromString(contractId);
  const preciseProposalId = BigNumber(proposalId);
  const queryParams = new ContractFunctionParameters().addUint256(preciseProposalId);
  const result = await queryContract(governorContractId, GovernorContractFunctions.GetProposalVotes, queryParams);
  const againstVotes = result?.getInt256(0);
  const forVotes = result?.getInt256(1);
  const abstainVotes = result?.getInt256(2);
  return { againstVotes, forVotes, abstainVotes };
};
interface CastVoteParams {
  contractId: string;
  proposalId: string;
  voteType: number;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
const castVote = async (params: CastVoteParams) => {
  const { contractId, proposalId, voteType, signer } = params;
  const governorContractId = ContractId.fromString(contractId);
  const preciseProposalId = BigNumber(proposalId);
  const contractFunctionParameters = new ContractFunctionParameters().addUint256(preciseProposalId).addUint8(voteType);
  const castVoteTransaction = await new ContractExecuteTransaction()
    .setContractId(governorContractId)
    .setFunction(GovernorContractFunctions.CastVote, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);
  const response = await castVoteTransaction.executeWithSigner(signer);
  return response;
};

interface CreateTransferTokenProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: BigNumber;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
const sendCreateTransferTokenProposalTransaction = async (
  params: CreateTransferTokenProposalParams
): Promise<TransactionResponse> => {
  const { title, description, linkToDiscussion, accountToTransferTo, tokenToTransfer, amountToTransfer, signer } =
    params;
  const accountToTransferFrom = TOKEN_USER_ID;
  const transferFromAddress = AccountId.fromString(accountToTransferFrom).toSolidityAddress();
  const transferToAddress = AccountId.fromString(accountToTransferTo).toSolidityAddress();
  const tokenToTransferAddress = AccountId.fromString(tokenToTransfer).toSolidityAddress();
  const contractCallParams = new ContractFunctionParameters()
    /** This is 'description' on the contract function */
    .addString(title)
    .addAddress(transferFromAddress)
    .addAddress(transferToAddress)
    .addAddress(tokenToTransferAddress)
    .addInt256(amountToTransfer)
    /** This is 'title' on the contract function */
    .addString(description)
    .addString(linkToDiscussion);
  const createProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(GovernorProxyContracts.TransferTokenContractId)
    .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
    .setGas(9000000)
    .freezeWithSigner(signer);
  const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
  return proposalTransactionResponse;
};

/**
 * TODO
 * @param description -
 * @param signer -
 * @returns
 */
const sendCreateTextProposalTransaction = async (
  description: string,
  signer: HashConnectSigner
): Promise<TransactionResponse> => {
  const contractCallParams = new ContractFunctionParameters().addString(description);
  const createProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(GovernorProxyContracts.TextProposalContractId)
    .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
    .setGas(9000000)
    .freezeWithSigner(signer);
  const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
  return proposalTransactionResponse;
};
interface ExecuteProposalParams {
  contractId: string;
  description: string;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
const executeProposal = async (params: ExecuteProposalParams) => {
  const { contractId, description, signer } = params;
  const governorContractId = ContractId.fromString(contractId);
  const contractFunctionParameters = new ContractFunctionParameters().addString(description);
  const executeProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(governorContractId)
    .setFunction(GovernorContractFunctions.ExecuteProposal, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);
  const executeTransactionResponse = await executeProposalTransaction.executeWithSigner(signer);
  return executeTransactionResponse;
};

const GovernorService = {
  fetchProposalState,
  fetchQuorum,
  fetchProposalVotes,
  castVote,
  sendCreateTextProposalTransaction,
  sendCreateTransferTokenProposalTransaction,
  executeProposal,
};

export default GovernorService;
export type { ProposalVotes };
