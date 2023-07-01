import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import {
  AccountId,
  ContractId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransactionResponse,
  TokenId,
} from "@hashgraph/sdk";
import { BaseDAOContractFunctions, MultiSigDAOContractFunctions } from "./type";
import { checkTransactionResponseForError } from "../utils";
import { Contracts } from "../../constants";
import { ethers } from "ethers";
import { DexService } from "@services";
import MultiSigDAOFactoryJSON from "../../abi/MultiSigDAOFactory.json";

const Gas = 9000000;

interface SendCreateMultiSigDAOTransactionParams {
  admin: string;
  name: string;
  logoUrl: string;
  owners: string[];
  description: string;
  daoLinks: string[];
  threshold: number;
  isPrivate: boolean;
  signer: HashConnectSigner;
}

async function sendCreateMultiSigDAOTransaction(
  params: SendCreateMultiSigDAOTransactionParams
): Promise<TransactionResponse> {
  const { admin, name, logoUrl, owners, threshold, isPrivate, signer, description, daoLinks } = params;
  const multiSigDAOFactoryContractId = ContractId.fromString(Contracts.MultiSigDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(admin).toSolidityAddress();
  const preciseThreshold = BigNumber(threshold);
  const ownersSolidityAddresses = owners.map((owner) => AccountId.fromString(owner).toSolidityAddress());
  const createDaoParams: any[] = [
    daoAdminAddress,
    name,
    logoUrl,
    ownersSolidityAddresses,
    preciseThreshold.toNumber(),
    isPrivate,
    description,
    daoLinks,
  ];
  const contractInterface = new ethers.utils.Interface(MultiSigDAOFactoryJSON.abi);
  const data = contractInterface.encodeFunctionData(BaseDAOContractFunctions.CreateDAO, [createDaoParams]);
  const createMultiSigDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOFactoryContractId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .freezeWithSigner(signer);
  const createMultiSigDAOResponse = await createMultiSigDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createMultiSigDAOResponse, BaseDAOContractFunctions.CreateDAO);
  return createMultiSigDAOResponse;
}

interface SendProposeTransferTransaction {
  tokenId: string;
  title: string;
  description: string;
  linkToDiscussion?: string;
  receiverId: string;
  amount: number;
  decimals: number;
  multiSigDAOContractId: string;
  safeId: string;
  signer: HashConnectSigner;
}

async function sendProposeTransferTransaction(params: SendProposeTransferTransaction) {
  const {
    tokenId,
    receiverId,
    safeId,
    amount,
    decimals,
    multiSigDAOContractId,
    signer,
    title,
    description,
    linkToDiscussion = "",
  } = params;
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const receiverSolidityAddress = AccountId.fromString(receiverId).toSolidityAddress();
  const preciseAmount = BigNumber(amount).shiftedBy(decimals).integerValue();
  await DexService.setTokenAllowance({
    tokenId,
    walletId: signer.getAccountId().toString(),
    spenderContractId: safeId,
    tokenAmount: preciseAmount.toNumber(),
    signer,
  });
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(tokenSolidityAddress)
    .addAddress(receiverSolidityAddress)
    .addUint256(preciseAmount)
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion);
  const sendProposeTransferTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOContractId)
    .setFunction(MultiSigDAOContractFunctions.ProposeTransferTransaction, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTransferTransactionResponse = await sendProposeTransferTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(
    sendProposeTransferTransactionResponse,
    MultiSigDAOContractFunctions.ProposeTransferTransaction
  );
  return sendProposeTransferTransactionResponse;
}

interface SendProposeTransaction {
  safeAccountId: string;
  data: string;
  multiSigDAOContractId: string;
  title: string;
  description: string;
  linkToDiscussion?: string;
  transactionType: number;
  signer: HashConnectSigner;
}

async function sendProposeTransaction(params: SendProposeTransaction) {
  const {
    safeAccountId,
    data,
    signer,
    multiSigDAOContractId,
    transactionType,
    title,
    description,
    linkToDiscussion = "",
  } = params;
  const safeSolidityAddress = ContractId.fromString(safeAccountId).toSolidityAddress();
  const ownerData = ethers.utils.arrayify(data);
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(safeSolidityAddress)
    .addBytes(ownerData)
    .addUint8(0)
    .addUint256(transactionType)
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion);
  const sendProposeTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOContractId)
    .setFunction(MultiSigDAOContractFunctions.ProposeTransaction, contractFunctionParameters)
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
  webLinks: string[];
  daoAccountId: string;
  signer: HashConnectSigner;
}

async function sendUpdateDAODetailsTransaction(params: UpdateDAODetailsTransactionParams) {
  const { name, description, logoUrl, webLinks, daoAccountId, signer } = params;
  const contractFunctionParameters = new ContractFunctionParameters()
    .addString(name)
    .addString(logoUrl)
    .addString(description)
    .addStringArray(webLinks);
  const sendProposeUpdateDAODetailsTransaction = await new ContractExecuteTransaction()
    .setContractId(daoAccountId)
    .setFunction(MultiSigDAOContractFunctions.UpdateDAOInfo, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeUpdateDAODetailsResponse = await sendProposeUpdateDAODetailsTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendProposeUpdateDAODetailsResponse, MultiSigDAOContractFunctions.UpdateDAOInfo);
  return sendProposeUpdateDAODetailsResponse;
}

export {
  sendCreateMultiSigDAOTransaction,
  sendProposeTransferTransaction,
  sendProposeTransaction,
  sendUpdateDAODetailsTransaction,
};
