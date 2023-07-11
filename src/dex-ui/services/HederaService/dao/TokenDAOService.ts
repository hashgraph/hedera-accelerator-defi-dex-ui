import { BigNumber } from "bignumber.js";
import { ethers } from "ethers";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import {
  AccountId,
  TokenId,
  ContractId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransactionResponse,
} from "@hashgraph/sdk";
import { BaseDAOContractFunctions, GovernorDAOContractFunctions } from "./type";
import { checkTransactionResponseForError } from "../utils";
import { Contracts, DEX_PRECISION } from "../../constants";
import { DexService } from "@services";
import FTDAOFactoryJSON from "../../abi/FTDAOFactory.json";

const Gas = 9000000;

interface SendCreateGovernanceDAOTransactionParams {
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  description: string;
  daoLinks: string[];
  tokenId: string;
  treasuryWalletAccountId: string;
  quorum: number;
  votingDuration: number;
  lockingDuration: number;
  signer: HashConnectSigner;
}

async function sendCreateGovernanceDAOTransaction(
  params: SendCreateGovernanceDAOTransactionParams
): Promise<TransactionResponse> {
  const {
    name,
    logoUrl,
    treasuryWalletAccountId,
    tokenId,
    quorum,
    lockingDuration,
    votingDuration,
    isPrivate,
    signer,
    description,
    daoLinks,
  } = params;
  const ftDAOFactoryContractId = ContractId.fromString(Contracts.FTDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(treasuryWalletAccountId).toSolidityAddress();
  const tokenAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const preciseQuorum = BigNumber(Math.round(quorum * 100)); // Quorum is incremented in 1/100th of percent;
  const preciseLockingDuration = BigNumber(lockingDuration);
  const preciseVotingDuration = BigNumber(votingDuration);
  const createDaoParams: any[] = [
    daoAdminAddress,
    name,
    logoUrl,
    tokenAddress,
    preciseQuorum.toNumber(),
    preciseLockingDuration.toNumber(),
    preciseVotingDuration.toNumber(),
    isPrivate,
    description,
    daoLinks,
  ];
  const contractInterface = new ethers.utils.Interface(FTDAOFactoryJSON.abi);
  const data = contractInterface.encodeFunctionData(BaseDAOContractFunctions.CreateDAO, [createDaoParams]);

  const createGovernanceDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(ftDAOFactoryContractId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .freezeWithSigner(signer);
  const createGovernanceDAOResponse = await createGovernanceDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createGovernanceDAOResponse, BaseDAOContractFunctions.CreateDAO);
  return createGovernanceDAOResponse;
}

interface SendProposeTokenTransferTransactionParams {
  tokenId: string;
  governanceTokenId: string;
  title: string;
  governanceAddress: string;
  linkToDiscussion: string;
  description: string;
  receiverId: string;
  amount: number;
  decimals: number;
  daoContractId: string;
  nftTokenSerialId: number;
  signer: HashConnectSigner;
}

async function sendProposeTokenTransferTransaction(params: SendProposeTokenTransferTransactionParams) {
  const {
    tokenId,
    governanceTokenId,
    receiverId,
    amount,
    decimals,
    daoContractId,
    signer,
    title,
    description,
    governanceAddress,
    linkToDiscussion,
    nftTokenSerialId,
  } = params;
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const receiverSolidityAddress = AccountId.fromString(receiverId).toSolidityAddress();
  const accountSolidityAddress = signer.getAccountId().toSolidityAddress();
  const preciseAmount = BigNumber(amount).shiftedBy(decimals).integerValue();
  const spenderContractId = AccountId.fromSolidityAddress(governanceAddress).toString();
  await DexService.setTokenAllowance({
    tokenId: governanceTokenId,
    walletId: signer.getAccountId().toString(),
    spenderContractId,
    tokenAmount: 1 * DEX_PRECISION,
    signer,
  });
  const contractCallParams = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addAddress(accountSolidityAddress)
    .addAddress(receiverSolidityAddress)
    .addAddress(tokenSolidityAddress)
    .addUint256(preciseAmount)
    .addUint256(nftTokenSerialId);

  const sendProposeTokenTransferTransaction = await new ContractExecuteTransaction()
    .setContractId(daoContractId)
    .setFunction(GovernorDAOContractFunctions.CreateTokenTransferProposal, contractCallParams)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTokenTransferTransactionResponse = await sendProposeTokenTransferTransaction.executeWithSigner(
    signer
  );
  checkTransactionResponseForError(
    sendProposeTokenTransferTransactionResponse,
    GovernorDAOContractFunctions.CreateTokenTransferProposal
  );
  return sendProposeTokenTransferTransactionResponse;
}

interface SendDAOContractUpgradeProposalTransactionParams {
  governanceTokenId: string;
  governanceAddress: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  newImplementationAddress: string;
  oldProxyAddress: string;
  daoContractId: string;
  nftTokenSerialId: number;
  signer: HashConnectSigner;
}
async function sendContractUpgradeTransaction(params: SendDAOContractUpgradeProposalTransactionParams) {
  const {
    governanceTokenId,
    daoContractId,
    signer,
    title,
    description,
    governanceAddress,
    linkToDiscussion,
    oldProxyAddress,
    newImplementationAddress,
    nftTokenSerialId,
  } = params;
  const spenderContractId = AccountId.fromSolidityAddress(governanceAddress).toString();
  const proxyContractAddress = ContractId.fromString(newImplementationAddress).toSolidityAddress();
  const proxyToUpgrade = ContractId.fromString(oldProxyAddress).toSolidityAddress();
  await DexService.setTokenAllowance({
    tokenId: governanceTokenId,
    walletId: signer.getAccountId().toString(),
    spenderContractId,
    tokenAmount: 1 * DEX_PRECISION,
    signer,
  });
  const contractCallParams = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addAddress(proxyContractAddress)
    .addAddress(proxyToUpgrade)
    .addUint256(nftTokenSerialId);

  const sendProposeTokenTransferTransaction = await new ContractExecuteTransaction()
    .setContractId(daoContractId)
    .setFunction(GovernorDAOContractFunctions.CreateContractUpgradeProposal, contractCallParams)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTokenTransferTransactionResponse = await sendProposeTokenTransferTransaction.executeWithSigner(
    signer
  );
  checkTransactionResponseForError(
    sendProposeTokenTransferTransactionResponse,
    GovernorDAOContractFunctions.CreateContractUpgradeProposal
  );
  return sendProposeTokenTransferTransactionResponse;
}

interface SendDAOTextProposalTransactionParams {
  governanceTokenId: string;
  governanceAddress: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  daoContractId: string;
  nftTokenSerialId: number;
  signer: HashConnectSigner;
}

async function sendTextProposalTransaction(params: SendDAOTextProposalTransactionParams) {
  const {
    governanceTokenId,
    daoContractId,
    signer,
    title,
    description,
    governanceAddress,
    linkToDiscussion,
    nftTokenSerialId,
  } = params;
  const spenderContractId = AccountId.fromSolidityAddress(governanceAddress).toString();
  await DexService.setTokenAllowance({
    tokenId: governanceTokenId,
    walletId: signer.getAccountId().toString(),
    spenderContractId,
    tokenAmount: 1 * DEX_PRECISION,
    signer,
  });
  const contractCallParams = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addUint256(nftTokenSerialId);

  const sendProposeTextProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(daoContractId)
    .setFunction(GovernorDAOContractFunctions.CreateTextProposal, contractCallParams)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTextProposalTransactionResponse = await sendProposeTextProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(
    sendProposeTextProposalTransactionResponse,
    GovernorDAOContractFunctions.CreateTextProposal
  );
  return sendProposeTextProposalTransactionResponse;
}

export {
  sendCreateGovernanceDAOTransaction,
  sendProposeTokenTransferTransaction,
  sendContractUpgradeTransaction,
  sendTextProposalTransaction,
};
