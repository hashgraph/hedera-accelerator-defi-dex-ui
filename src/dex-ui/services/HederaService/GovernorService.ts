import { BigNumber } from "bignumber.js";
import {
  TokenId,
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransactionResponse,
  FileCreateTransaction,
  PrivateKey,
  ContractCreateTransaction,
  FileAppendTransaction,
} from "@hashgraph/sdk";
import { ContractId } from "@hashgraph/sdk";
import { GovernorProxyContracts, TOKEN_USER_KEY } from "../constants";
import { GovernorContractFunctions } from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { checkTransactionResponseForError, queryContract, client } from "./utils";

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

export interface FetchHasVotedParams {
  /** The id of the governor contract. */
  contractId: string;
  /** The id of the governor proposal. */
  proposalId: string;
  /** The account signing the transaction. */
  signer: HashConnectSigner;
}
/**
 * Queries a contract to see if an account id has voted on the specified proposal.
 * @param params - {@link FetchHasVotedParams}
 * @returns true if the account has voted on the proposal.
 */
const fetchHasVoted = async (params: FetchHasVotedParams): Promise<boolean | undefined> => {
  const { contractId, proposalId, signer } = params;
  const governorContractId = ContractId.fromString(contractId);
  const preciseProposalId = BigNumber(proposalId);
  const accountAddress = signer.getAccountId().toSolidityAddress();
  const queryParams = new ContractFunctionParameters().addUint256(preciseProposalId).addAddress(accountAddress);
  const result = await queryContract(governorContractId, GovernorContractFunctions.GetHasVoted, queryParams);
  const hasVoted = result?.getBool(0);
  return hasVoted;
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
  checkTransactionResponseForError(response, GovernorContractFunctions.CastVote);
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
  const transferFromAddress = signer.getAccountId().toSolidityAddress();
  const transferToAddress = AccountId.fromString(accountToTransferTo).toSolidityAddress();
  const tokenToTransferAddress = TokenId.fromString(tokenToTransfer).toSolidityAddress();
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

interface CreateContratctUpgradeProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  contarctId: string;
  proxyId: string;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
const sendCreateContractUpgradeProposalTransaction = async (
  params: CreateContratctUpgradeProposalParams
): Promise<TransactionResponse> => {
  const { title, linkToDiscussion, description, contarctId, proxyId, signer } = params;
  console.log(`Contract Upgrade Details ${linkToDiscussion} ${description}`);
  const upgradeProposalContractId = ContractId.fromString(contarctId).toSolidityAddress();
  const upgradeProposalProxyId = ContractId.fromString(proxyId).toSolidityAddress();

  const contractCallParams = new ContractFunctionParameters()
    .addString(title)
    .addAddress(upgradeProposalProxyId)
    .addAddress(upgradeProposalContractId);

  const createUpgradeProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(GovernorProxyContracts.ContractUpgradeContractId)
    .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
    .setGas(9000000)
    .freezeWithSigner(signer);
  const proposalTransactionResponse = await createUpgradeProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(proposalTransactionResponse, GovernorContractFunctions.CreateProposal);
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
  title: string;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
const executeProposal = async (params: ExecuteProposalParams) => {
  const { contractId, title, signer } = params;
  const governorContractId = ContractId.fromString(contractId);
  /** This parameter is named 'description' on the contract function */
  const contractFunctionParameters = new ContractFunctionParameters().addString(title);
  const executeProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(governorContractId)
    .setFunction(GovernorContractFunctions.ExecuteProposal, contractFunctionParameters)
    .setGas(1000000)
    .freezeWithSigner(signer);
  const executeTransactionResponse = await executeProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(executeTransactionResponse, GovernorContractFunctions.ExecuteProposal);
  return executeTransactionResponse;
};

interface SendClaimGODTokenTransactionParams {
  contractId: string;
  proposalId: string;
  signer: HashConnectSigner;
}

const sendClaimGODTokenTransaction = async (params: SendClaimGODTokenTransactionParams) => {
  const { contractId, proposalId, signer } = params;
  const preciseProposalId = BigNumber(proposalId);
  const governorContractId = ContractId.fromString(contractId);
  const contractFunctionParameters = new ContractFunctionParameters().addUint256(preciseProposalId);
  const executeClaimGODTokenTransaction = await new ContractExecuteTransaction()
    .setContractId(governorContractId)
    .setFunction(GovernorContractFunctions.ClaimGODToken, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);
  const claimGODTokenresponse = await executeClaimGODTokenTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(claimGODTokenresponse, GovernorContractFunctions.ClaimGODToken);
  return claimGODTokenresponse;
};

/**
 * TODO
 * @param params -
 * @returns
 */
const deployABIFile = async (abiFile: string) => {
  const compiledContract = JSON.parse(abiFile);
  const contractByteCode = compiledContract.bytecode;
  const userKey = PrivateKey.fromString(TOKEN_USER_KEY);

  const fileCreateTx = await new FileCreateTransaction().setKeys([userKey]).execute(client);
  const fileCreateRx = await fileCreateTx.getReceipt(client);
  const bytecodeFileId = fileCreateRx.fileId;

  const fileAppendTx = await new FileAppendTransaction()
    .setFileId(bytecodeFileId ?? "")
    .setContents(contractByteCode)
    .setMaxChunks(100)
    .execute(client);
  await fileAppendTx.getReceipt(client);

  const contractCreateTx = await new ContractCreateTransaction()
    .setAdminKey(userKey)
    .setBytecodeFileId(bytecodeFileId ?? "")
    .setConstructorParameters(new ContractFunctionParameters())
    .setGas(9000000)
    .execute(client);

  const deployABIFileResponse = await contractCreateTx.getReceipt(client);
  const contractId = deployABIFileResponse.contractId;
  // client.close();

  checkTransactionResponseForError(deployABIFileResponse, GovernorContractFunctions.DeployABIFile);
  return {
    id: contractId?.toString() ?? "",
    address: "0x" + contractId?.toSolidityAddress() ?? "",
  };
};

const GovernorService = {
  sendClaimGODTokenTransaction,
  fetchProposalState,
  fetchHasVoted,
  fetchQuorum,
  fetchProposalVotes,
  castVote,
  sendCreateTextProposalTransaction,
  sendCreateTransferTokenProposalTransaction,
  executeProposal,
  deployABIFile,
  sendCreateContractUpgradeProposalTransaction,
};

export default GovernorService;
export type { ProposalVotes };
