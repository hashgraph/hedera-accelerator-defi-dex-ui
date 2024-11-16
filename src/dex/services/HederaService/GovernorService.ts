import { BigNumber } from "bignumber.js";
import {
  TokenId,
  AccountId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransactionResponse,
} from "@hashgraph/sdk";
import { ContractId } from "@hashgraph/sdk";
import { Contracts, GovernanceTokenId } from "../constants";
import { GovernorContractFunctions } from "./types";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { checkTransactionResponseForError } from "./utils";
import { DexService } from "@dex/services";
import { ethers } from "ethers";
import { Proposal } from "@dao/hooks";

/**
 * General format of service calls:
 * 1 - Convert data types.
 * 2 - Create contract parameters.
 * 3 - Create and sign transaction.
 * 4 - Send transaction to wallet and execute transaction.
 * 5 - Extract and return resulting data.
 */
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
    .setGas(1000000)
    .freezeWithSigner(signer);
  const response = await castVoteTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(response, GovernorContractFunctions.CastVote);
  return response;
};

interface CancelProposalParams {
  contractId: string;
  proposal: Proposal;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
const cancelProposal = async (params: CancelProposalParams) => {
  const { contractId, proposal, signer } = params;
  const governorContractId = ContractId.fromString(contractId);
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddressArray(proposal.coreInformation?.inputs?.targets ?? [])
    .addUint256Array(proposal.coreInformation?.inputs?._values.map((value) => Number(value)) ?? [])
    .addBytesArray(
      proposal.coreInformation?.inputs?.calldatas?.map((item: string) => ethers.utils.arrayify(item)) ?? []
    )
    .addBytes32(stringToByetes32(proposal.title));
  const cancelProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(governorContractId)
    .setFunction(GovernorContractFunctions.Cancel, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);
  const response = await cancelProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(response, GovernorContractFunctions.Cancel);
  return response;
};

interface CreateTransferTokenProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: BigNumber;
  nftTokenSerialId: number;
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
  const {
    title,
    description,
    linkToDiscussion,
    accountToTransferTo,
    tokenToTransfer,
    amountToTransfer,
    nftTokenSerialId,
    signer,
  } = params;
  const transferFromAddress = signer.getAccountId().toSolidityAddress();
  const transferToAddress = AccountId.fromString(accountToTransferTo).toSolidityAddress();
  const tokenToTransferAddress = TokenId.fromString(tokenToTransfer).toSolidityAddress();
  const transferTokenContractId = ContractId.fromString(Contracts.Governor.TransferToken.ProxyId);
  const walletId = signer.getAccountId().toString();
  await DexService.setTokenAllowance({
    tokenId: GovernanceTokenId,
    walletId,
    spenderContractId: Contracts.Governor.TransferToken.ProxyId,
    tokenAmount: (await DexService.fetchTokenData(GovernanceTokenId)).data.precision,
    signer,
  });
  const contractCallParams = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addAddress(transferFromAddress)
    .addAddress(transferToAddress)
    .addAddress(tokenToTransferAddress)
    .addUint256(amountToTransfer)
    .addUint256(nftTokenSerialId);

  const createProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(transferTokenContractId)
    .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
    .setGas(9000000)
    .freezeWithSigner(signer);
  const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
  return proposalTransactionResponse;
};

interface CreateContractUpgradeProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  contractToUpgrade: string;
  newContractProxyId: string;
  nftTokenSerialId: number;
  signer: HashConnectSigner;
}

/**
 * TODO
 * @param params -
 * @returns
 */
const sendCreateContractUpgradeProposalTransaction = async (
  params: CreateContractUpgradeProposalParams
): Promise<TransactionResponse> => {
  const { title, linkToDiscussion, description, contractToUpgrade, newContractProxyId, nftTokenSerialId, signer } =
    params;
  const contractIdToUpgrade = ContractId.fromString(contractToUpgrade).toSolidityAddress();
  const upgradeProposalProxyId = ContractId.fromString(newContractProxyId).toSolidityAddress();
  const contractUpgradeContractId = ContractId.fromString(Contracts.Governor.ContractUpgrade.ProxyId);
  const walletId = signer.getAccountId().toString();
  /* NOTE: Metadata is not currently in use for this proposal type. Should be removed from the Smart Contracts */
  const metadata = "";
  await DexService.setTokenAllowance({
    tokenId: GovernanceTokenId,
    walletId,
    spenderContractId: Contracts.Governor.ContractUpgrade.ProxyId,
    tokenAmount: (await DexService.fetchTokenData(GovernanceTokenId)).data.precision,
    signer,
  });
  const contractCallParams = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addString(metadata)
    .addAddress(upgradeProposalProxyId)
    .addAddress(contractIdToUpgrade)
    .addUint256(nftTokenSerialId);
  const createUpgradeProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(contractUpgradeContractId)
    .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
    .setGas(9000000)
    .freezeWithSigner(signer);
  const proposalTransactionResponse = await createUpgradeProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(proposalTransactionResponse, GovernorContractFunctions.CreateProposal);
  return proposalTransactionResponse;
};

interface CreateTextProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  nftTokenSerialId: number;
  signer: HashConnectSigner;
}
/**
 * TODO
 * @param description -
 * @param signer -
 * @returns
 */
const sendCreateTextProposalTransaction = async (params: CreateTextProposalParams): Promise<TransactionResponse> => {
  const { title, linkToDiscussion, description, nftTokenSerialId, signer } = params;
  const textProposalContractId = ContractId.fromString(Contracts.Governor.TextProposal.ProxyId);
  const walletId = signer.getAccountId().toString();
  /* NOTE: Metadata is not currently in use for this proposal type. Should be removed from the Smart Contracts */
  const metadata = "";

  await DexService.setTokenAllowance({
    tokenId: GovernanceTokenId,
    walletId,
    spenderContractId: Contracts.Governor.TextProposal.ProxyId,
    tokenAmount: (await DexService.fetchTokenData(GovernanceTokenId)).data.precision,
    signer,
  });
  const contractCallParams = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addString(metadata)
    .addUint256(nftTokenSerialId);
  const createProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(textProposalContractId)
    .setFunction(GovernorContractFunctions.CreateProposal, contractCallParams)
    .setGas(9000000)
    .freezeWithSigner(signer);
  const proposalTransactionResponse = await createProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(proposalTransactionResponse, GovernorContractFunctions.CreateProposal);
  return proposalTransactionResponse;
};

interface ExecuteProposalParams {
  contractId: string;
  proposal: Proposal;
  signer: HashConnectSigner;
  transfersFromAccount?: string;
  transfersToAccount?: string;
  tokenId?: string;
  tokenAmount?: number;
}

/**
 * TODO
 * @param params -
 * @returns
 */
const executeProposal = async (params: ExecuteProposalParams) => {
  const { contractId, proposal, signer, transfersFromAccount, tokenId, tokenAmount } = params;
  const governorContractId = ContractId.fromString(contractId);
  /** This parameter is named 'description' on the contract function */
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddressArray(proposal.coreInformation?.inputs?.targets ?? [])
    .addUint256Array(proposal.coreInformation?.inputs?._values?.map((value) => Number(value)) ?? [])
    .addBytesArray(
      proposal.coreInformation?.inputs?.calldatas?.map((item: string) => ethers.utils.arrayify(item)) ?? []
    )
    .addBytes32(stringToByetes32(proposal.title));

  if (tokenId && transfersFromAccount && tokenAmount) {
    await DexService.setTokenAllowance({
      tokenId,
      walletId: transfersFromAccount,
      spenderContractId: contractId,
      tokenAmount,
      signer: signer,
    });
  }
  const executeProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(governorContractId)
    .setFunction(GovernorContractFunctions.Execute, contractFunctionParameters)
    .setGas(1000000)
    .freezeWithSigner(signer);
  const executeTransactionResponse = await executeProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(executeTransactionResponse, GovernorContractFunctions.Execute);
  return executeTransactionResponse;
};

const stringToByetes32 = (input: string) => {
  const toUtf8Bytes = ethers.utils.toUtf8Bytes(input);
  const keccak256 = ethers.utils.keccak256(toUtf8Bytes);
  return ethers.utils.arrayify(keccak256);
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

interface SendLockGODTokenTransactionParams {
  tokenAmount: number;
  tokenHolderAddress: string;
  tokenDecimals: string;
  signer: HashConnectSigner;
}

const sendLockGODTokenTransaction = async (params: SendLockGODTokenTransactionParams) => {
  const { tokenAmount, signer, tokenHolderAddress, tokenDecimals } = params;
  const godHolderContractId = ContractId.fromString(tokenHolderAddress);
  const amount = BigNumber(tokenAmount).shiftedBy(Number(tokenDecimals));
  const contractFunctionParameters = new ContractFunctionParameters().addUint256(amount);
  const executeSendLockGODTokenTransaction = await new ContractExecuteTransaction()
    .setContractId(godHolderContractId)
    .setFunction(GovernorContractFunctions.LockGODToken, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);
  const sendLockGODTokenResponse = await executeSendLockGODTokenTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendLockGODTokenResponse, GovernorContractFunctions.LockGODToken);
  return sendLockGODTokenResponse;
};

interface SendUnLockGODTokenTransactionParams {
  tokenAmount: number;
  tokenHolderAddress: string;
  tokenDecimals: string;
  signer: HashConnectSigner;
}

const sendUnLockGODTokenTransaction = async (params: SendUnLockGODTokenTransactionParams) => {
  const { tokenAmount, signer, tokenHolderAddress, tokenDecimals } = params;
  const godHolderContractId = ContractId.fromString(tokenHolderAddress);
  const amount = BigNumber(tokenAmount).shiftedBy(Number(tokenDecimals));
  const contractFunctionParameters = new ContractFunctionParameters().addUint256(amount);
  const executeSendUnLockGODTokenTransaction = await new ContractExecuteTransaction()
    .setContractId(godHolderContractId)
    .setFunction(GovernorContractFunctions.UnLockGODToken, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);
  const sendUnLockGODTokenResponse = await executeSendUnLockGODTokenTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendUnLockGODTokenResponse, GovernorContractFunctions.UnLockGODToken);
  return sendUnLockGODTokenResponse;
};

interface GetLatestProposalDetailsParams {
  proposalId: string;
  contractId: string;
  signer: HashConnectSigner;
}

const getLatestProposalDetails = async (params: GetLatestProposalDetailsParams) => {
  console.log("");
};

const GovernorService = {
  sendClaimGODTokenTransaction,
  castVote,
  cancelProposal,
  sendCreateTextProposalTransaction,
  sendCreateTransferTokenProposalTransaction,
  executeProposal,
  sendCreateContractUpgradeProposalTransaction,
  sendLockGODTokenTransaction,
  sendUnLockGODTokenTransaction,
  getLatestProposalDetails,
};

export default GovernorService;
