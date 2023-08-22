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
  Hbar,
  HbarUnit,
} from "@hashgraph/sdk";
import { BaseDAOContractFunctions, GovernorDAOContractFunctions } from "./types";
import { DexService, checkTransactionResponseForError, Contracts, DEX_PRECISION } from "@dex/services";
import { DAOType } from "@dao/services";
import FTDAOFactoryJSON from "@dex/services/abi/FTDAOFactory.json";
import { isHbarToken } from "@dex/utils";

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
  const contractCallParams = new ContractFunctionParameters();
  const spenderContractId = AccountId.fromSolidityAddress(governanceAddress).toString();
  let preciseAmount = BigNumber(amount).shiftedBy(decimals).integerValue();
  let functionName = GovernorDAOContractFunctions.CreateTokenTransferProposal;
  await DexService.setTokenAllowance({
    tokenId: governanceTokenId,
    walletId: signer.getAccountId().toString(),
    spenderContractId,
    tokenAmount: 1 * DEX_PRECISION,
    signer,
  });
  if (isHbarToken(tokenId)) {
    preciseAmount = Hbar.from(amount, HbarUnit.Hbar).to(HbarUnit.Tinybar);
    functionName = GovernorDAOContractFunctions.CreateHBarTransferProposal;
    contractCallParams
      .addString(title)
      .addString(description)
      .addString(linkToDiscussion)
      .addAddress(receiverSolidityAddress)
      .addUint256(preciseAmount)
      .addUint256(nftTokenSerialId);
  } else {
    contractCallParams
      .addString(title)
      .addString(description)
      .addString(linkToDiscussion)
      .addAddress(receiverSolidityAddress)
      .addAddress(tokenSolidityAddress)
      .addUint256(preciseAmount)
      .addUint256(nftTokenSerialId);
  }
  const sendProposeTokenTransferTransaction = await new ContractExecuteTransaction()
    .setContractId(daoContractId)
    .setFunction(functionName, contractCallParams)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTokenTransferTransactionResponse = await sendProposeTokenTransferTransaction.executeWithSigner(
    signer
  );
  checkTransactionResponseForError(sendProposeTokenTransferTransactionResponse, functionName);
  return sendProposeTokenTransferTransactionResponse;
}

interface TokenAssociateTransactionParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  tokenId: string;
  governanceTokenId: string;
  daoAccountId: string;
  governanceAddress: string;
  nftTokenSerialId: number;
  signer: HashConnectSigner;
}

async function sendGOVTokenAssociateTransaction(params: TokenAssociateTransactionParams) {
  const {
    title,
    description,
    linkToDiscussion,
    tokenId,
    governanceTokenId,
    daoAccountId,
    governanceAddress,
    nftTokenSerialId,
    signer,
  } = params;
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const spenderContractId = AccountId.fromSolidityAddress(governanceAddress).toString();
  const governanceTokenDetails = await DexService.fetchTokenData(governanceTokenId);
  const governanceTokenDecimals = governanceTokenDetails.data.decimals;
  const tokenAmount = BigNumber(1).shiftedBy(Number(governanceTokenDecimals)).toNumber();
  const contractFunctionParameters = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addAddress(tokenSolidityAddress)
    .addUint256(nftTokenSerialId);
  await DexService.setTokenAllowance({
    tokenId: governanceTokenId,
    walletId: signer.getAccountId().toString(),
    spenderContractId,
    tokenAmount,
    signer,
  });
  const sendProposeTokenAssociationTransaction = await new ContractExecuteTransaction()
    .setContractId(daoAccountId)
    .setFunction(GovernorDAOContractFunctions.CreateTokenAssociationProposal, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTokenAssociationResponse = await sendProposeTokenAssociationTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(
    sendProposeTokenAssociationResponse,
    GovernorDAOContractFunctions.CreateTokenAssociationProposal
  );
  return sendProposeTokenAssociationResponse;
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
  const proxyEVMAddress = await DexService.fetchContractEVMAddress(oldProxyAddress);
  const proxyLogicEVMAddress = await DexService.fetchContractEVMAddress(newImplementationAddress);
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
    .addAddress(proxyEVMAddress)
    .addAddress(proxyLogicEVMAddress)
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
  daoType: DAOType;
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
    daoType,
  } = params;
  const spenderContractId = AccountId.fromSolidityAddress(governanceAddress).toString();
  if (daoType === DAOType.NFT) {
    await DexService.setNFTAllowance({
      nftId: governanceTokenId,
      walletId: signer.getAccountId().toString(),
      spenderContractId,
      signer,
    });
  } else {
    await DexService.setTokenAllowance({
      tokenId: governanceTokenId,
      walletId: signer.getAccountId().toString(),
      spenderContractId,
      tokenAmount: 1 * DEX_PRECISION,
      signer,
    });
  }
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
  sendGOVTokenAssociateTransaction,
};
