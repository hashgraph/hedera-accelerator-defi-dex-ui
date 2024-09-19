import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/signer";
import {
  AccountId,
  ContractId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransactionResponse,
  TokenId,
  TransferTransaction,
  Hbar,
} from "@hashgraph/sdk";
import { BaseDAOContractFunctions, MultiSigDAOContractFunctions } from "./types";
import { checkTransactionResponseForError } from "@dex/services/HederaService/utils";
import { Contracts } from "@dex/services/constants";
import { ethers } from "ethers";
import MultiSigDAOFactoryJSON from "@dex/services/abi/MultiSigDAOFactory.json";
import { isHbarToken } from "@dex/utils";
import BaseDAOJSON from "@dex/services/abi/BaseDAO.json";
import { DexService } from "@dex/services";
import { DAOConfigDetails } from "@dao/hooks";

const Gas = 9000000;

interface SendCreateMultiSigDAOTransactionParams {
  admin: string;
  name: string;
  logoUrl: string;
  infoUrl: string;
  owners: string[];
  description: string;
  daoLinks: string[];
  threshold: number;
  isPrivate: boolean;
  daoFeeConfig: DAOConfigDetails;
  signer: HashConnectSigner;
}

async function sendCreateMultiSigDAOTransaction(
  params: SendCreateMultiSigDAOTransactionParams
): Promise<TransactionResponse> {
  const { admin, name, logoUrl, infoUrl, owners, threshold, isPrivate, signer, description, daoLinks, daoFeeConfig } =
    params;
  const { daoFee, tokenType, tokenId } = daoFeeConfig;
  const multiSigDAOFactoryContractId = ContractId.fromString(Contracts.MultiSigDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(admin).toSolidityAddress();
  const preciseThreshold = BigNumber(threshold);
  const ownersSolidityAddresses = owners.map((owner) => AccountId.fromString(owner).toSolidityAddress());
  const createDaoParams: any[] = [
    daoAdminAddress,
    name,
    logoUrl,
    infoUrl,
    ownersSolidityAddresses,
    preciseThreshold.toNumber(),
    isPrivate,
    description,
    daoLinks,
  ];
  const contractInterface = new ethers.utils.Interface(MultiSigDAOFactoryJSON.abi);
  const data = contractInterface.encodeFunctionData(BaseDAOContractFunctions.CreateDAO, [createDaoParams]);
  const isHbar = isHbarToken(tokenId);
  const hBarPayable = Hbar.fromTinybars(isHbar ? daoFee : 0);
  await DexService.setUpAllowance({
    tokenId: tokenId,
    tokenAmount: daoFee,
    spenderContractId: Contracts.MultiSigDAOFactory.ProxyId,
    tokenType,
    nftSerialId: daoFee,
    signer,
  });
  const createMultiSigDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOFactoryContractId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .setPayableAmount(hBarPayable)
    .freezeWithSigner(signer);
  const createMultiSigDAOResponse = await createMultiSigDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createMultiSigDAOResponse, BaseDAOContractFunctions.CreateDAO);
  return createMultiSigDAOResponse;
}

interface SendProposeTransaction {
  safeEVMAddress: string;
  data: string;
  multiSigDAOContractId: string;
  title: string;
  description: string;
  linkToDiscussion?: string;
  metadata?: string;
  transactionType: number;
  hBarPayableValue?: number;
  signer: HashConnectSigner;
}

async function sendProposeTransaction(params: SendProposeTransaction) {
  const {
    safeEVMAddress,
    data,
    signer,
    multiSigDAOContractId,
    transactionType,
    title,
    description,
    metadata = "",
    hBarPayableValue,
    linkToDiscussion = "",
  } = params;
  const hBarAmount = hBarPayableValue ? hBarPayableValue : 0;
  const ownerData = ethers.utils.arrayify(data);
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(safeEVMAddress)
    .addBytes(ownerData)
    .addUint256(transactionType)
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addString(metadata);

  const sendProposeTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOContractId)
    .setFunction(MultiSigDAOContractFunctions.ProposeTransaction, contractFunctionParameters)
    .setGas(Gas)
    .setPayableAmount(hBarAmount)
    .freezeWithSigner(signer);
  const sendProposeTransactionResponse = await sendProposeTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendProposeTransactionResponse, MultiSigDAOContractFunctions.ProposeTransaction);
  return sendProposeTransactionResponse;
}

interface SendProposeTransferTransaction {
  to: string;
  tokenAddress: string;
  amountOrId: number;
  multiSigDAOContractId: string;
  title: string;
  description: string;
  linkToDiscussion?: string;
  signer: HashConnectSigner;
}

async function sendProposeTransferTransaction(params: SendProposeTransferTransaction) {
  const {
    to,
    tokenAddress,
    amountOrId,
    multiSigDAOContractId,
    title,
    description,
    linkToDiscussion = "",
    signer,
  } = params;
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(to)
    .addAddress(tokenAddress)
    .addUint256(amountOrId)
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion);
  const sendProposeTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOContractId)
    .setFunction(MultiSigDAOContractFunctions.ProposeTransferTransaction, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTransactionResponse = await sendProposeTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendProposeTransactionResponse, MultiSigDAOContractFunctions.ProposeTransaction);
  return sendProposeTransactionResponse;
}

interface UpdateDAODetailsTransactionParams {
  name: string;
  description: string;
  logoUrl: string;
  infoUrl: string;
  webLinks: string[];
  daoAccountId: string;
  signer: HashConnectSigner;
}

async function sendUpdateDAODetailsTransaction(params: UpdateDAODetailsTransactionParams) {
  const { name, description, logoUrl, infoUrl, webLinks, daoAccountId, signer } = params;
  const contractInterface = new ethers.utils.Interface(BaseDAOJSON.abi);
  const updateDaoParams: any[] = [name, logoUrl, infoUrl, description, webLinks];
  const data = contractInterface.encodeFunctionData(BaseDAOContractFunctions.UpdateDAOInfo, updateDaoParams);
  const sendProposeUpdateDAODetailsTransaction = await new ContractExecuteTransaction()
    .setContractId(daoAccountId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeUpdateDAODetailsResponse = await sendProposeUpdateDAODetailsTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendProposeUpdateDAODetailsResponse, BaseDAOContractFunctions.UpdateDAOInfo);
  return sendProposeUpdateDAODetailsResponse;
}

interface TokenAssociateTransactionParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  tokenId: string;
  daoAccountId: string;
  signer: HashConnectSigner;
}

async function sendDAOTokenAssociateTransaction(params: TokenAssociateTransactionParams) {
  const { title, description, linkToDiscussion, tokenId, daoAccountId, signer } = params;
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(tokenSolidityAddress)
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion);
  const sendProposeTokenAssociationTransaction = await new ContractExecuteTransaction()
    .setContractId(daoAccountId)
    .setFunction(MultiSigDAOContractFunctions.ProposeTokenAssociation, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTokenAssociationResponse = await sendProposeTokenAssociationTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(
    sendProposeTokenAssociationResponse,
    MultiSigDAOContractFunctions.ProposeTokenAssociation
  );
  return sendProposeTokenAssociationResponse;
}

interface DepositTokensTransactionParams {
  safeId: string;
  tokenId: string;
  amount: number;
  decimals: number;
  isNFT: boolean;
  nftSerialId: number;
  signer: HashConnectSigner;
}

async function sendTokensTransaction(params: DepositTokensTransactionParams): Promise<TransactionResponse> {
  const { safeId, tokenId, amount, decimals, isNFT, nftSerialId, signer } = params;
  const walletId = signer.getAccountId().toString();
  const preciseAmount = BigNumber(amount).shiftedBy(decimals).toNumber();
  if (isNFT) {
    const depositTokensTransaction = await new TransferTransaction()
      .addNftTransfer(tokenId, nftSerialId, walletId, safeId)
      .freezeWithSigner(signer);
    const depositTokensResponse = await depositTokensTransaction.executeWithSigner(signer);
    checkTransactionResponseForError(depositTokensResponse, MultiSigDAOContractFunctions.DepositTokens);
    return depositTokensResponse;
  } else if (isHbarToken(tokenId)) {
    const depositTokensTransaction = await new TransferTransaction()
      .addHbarTransfer(walletId, -amount)
      .addHbarTransfer(safeId, amount)
      .freezeWithSigner(signer);
    const depositTokensResponse = await depositTokensTransaction.executeWithSigner(signer);
    checkTransactionResponseForError(depositTokensResponse, MultiSigDAOContractFunctions.DepositTokens);
    return depositTokensResponse;
  } else {
    const depositTokensTransaction = await new TransferTransaction()
      .addTokenTransfer(tokenId, walletId, -preciseAmount)
      .addTokenTransfer(tokenId, safeId, preciseAmount)
      .freezeWithSigner(signer);
    const depositTokensResponse = await depositTokensTransaction.executeWithSigner(signer);
    checkTransactionResponseForError(depositTokensResponse, MultiSigDAOContractFunctions.DepositTokens);
    return depositTokensResponse;
  }
}

export interface ProposeMultiSigDAOUpgradeProposalParams {
  multiSigDAOContractId: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  newImplementationAddress: string;
  oldProxyAddress: string;
  signer: HashConnectSigner;
}

async function proposeMultiSigDAOUpgradeProposal(params: ProposeMultiSigDAOUpgradeProposalParams) {
  const {
    multiSigDAOContractId,
    signer,
    title,
    description,
    linkToDiscussion,
    newImplementationAddress,
    oldProxyAddress,
  } = params;
  const proxyToUpgradeEVMAddress = await DexService.fetchContractEVMAddress(oldProxyAddress);
  const proxyEVMAddress = await DexService.fetchContractEVMAddress(newImplementationAddress);
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(proxyToUpgradeEVMAddress)
    .addAddress(proxyEVMAddress)
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion);
  const sendProposeDAOUpgradeTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOContractId)
    .setFunction(MultiSigDAOContractFunctions.ProposeDAOUpgrade, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeDAOUpgradeResponse = await sendProposeDAOUpgradeTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendProposeDAOUpgradeResponse, MultiSigDAOContractFunctions.ProposeDAOUpgrade);
  return sendProposeDAOUpgradeResponse;
}

export {
  sendCreateMultiSigDAOTransaction,
  sendProposeTransferTransaction,
  sendProposeTransaction,
  sendUpdateDAODetailsTransaction,
  sendDAOTokenAssociateTransaction,
  sendTokensTransaction,
  proposeMultiSigDAOUpgradeProposal,
};
