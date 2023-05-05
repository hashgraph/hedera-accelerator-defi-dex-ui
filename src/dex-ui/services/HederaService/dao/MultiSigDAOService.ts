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

const Gas = 9000000;

interface SendCreateMultiSigDAOTransactionParams {
  admin: string;
  name: string;
  logoUrl: string;
  owners: string[];
  threshold: number;
  isPrivate: boolean;
  signer: HashConnectSigner;
}

async function sendCreateMultiSigDAOTransaction(
  params: SendCreateMultiSigDAOTransactionParams
): Promise<TransactionResponse> {
  const { admin, name, logoUrl, owners, threshold, isPrivate, signer } = params;
  const multiSigDAOFactoryContractId = ContractId.fromString(Contracts.MultiSigDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(admin).toSolidityAddress();
  const preciseThreshold = BigNumber(threshold);
  const ownersSolidityAddresses = owners.map((owner) => AccountId.fromString(owner).toSolidityAddress());
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(daoAdminAddress)
    .addString(name)
    .addString(logoUrl)
    .addAddressArray(ownersSolidityAddresses)
    .addUint256(preciseThreshold)
    .addBool(isPrivate);
  const createMultiSigDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOFactoryContractId)
    .setFunction(BaseDAOContractFunctions.CreateDAO, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const createMultiSigDAOResponse = await createMultiSigDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createMultiSigDAOResponse, BaseDAOContractFunctions.CreateDAO);
  return createMultiSigDAOResponse;
}

interface SendProposeTransferTransaction {
  tokenId: string;
  receiverId: string;
  amount: number;
  decimals: number;
  multiSigDAOContractId: string;
  safeId: string;
  signer: HashConnectSigner;
}

async function sendProposeTransferTransaction(params: SendProposeTransferTransaction) {
  const { tokenId, receiverId, safeId, amount, decimals, multiSigDAOContractId, signer } = params;
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
    .addUint256(preciseAmount);
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
  signer: HashConnectSigner;
}

async function sendProposeTransaction(params: SendProposeTransaction) {
  const { safeAccountId, data, signer, multiSigDAOContractId } = params;
  const safeSolidityAddress = ContractId.fromString(safeAccountId).toSolidityAddress();
  const ownerData = ethers.utils.arrayify(data);
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(safeSolidityAddress)
    .addBytes(ownerData)
    .addUint8(0);
  const sendProposeTransaction = await new ContractExecuteTransaction()
    .setContractId(multiSigDAOContractId)
    .setFunction(MultiSigDAOContractFunctions.ProposeTransaction, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTransactionResponse = await sendProposeTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendProposeTransactionResponse, MultiSigDAOContractFunctions.ProposeTransaction);
  return sendProposeTransactionResponse;
}

export { sendCreateMultiSigDAOTransaction, sendProposeTransferTransaction, sendProposeTransaction };
