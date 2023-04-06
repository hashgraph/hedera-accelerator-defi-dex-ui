import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import {
  AccountId,
  TokenId,
  ContractId,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransactionResponse,
} from "@hashgraph/sdk";
import { DAOContractFunctions } from "./type";
import { checkTransactionResponseForError } from "../utils";
import { Contracts } from "../../constants";

const Gas = 900000;

interface SendCreateGovernanceDAOTransactionParams {
  name: string;
  logoUrl: string;
  isPrivate: boolean;
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
  } = params;
  const governanceDAOFactoryContractId = ContractId.fromString(Contracts.GovernanceDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(treasuryWalletAccountId).toSolidityAddress();
  const tokenAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const preciseQuorum = BigNumber(quorum);
  const preciseLockingDuration = BigNumber(lockingDuration);
  const preciseVotingDuration = BigNumber(votingDuration);
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(daoAdminAddress)
    .addString(name)
    .addString(logoUrl)
    .addAddress(tokenAddress)
    .addUint256(preciseQuorum)
    .addUint256(preciseLockingDuration)
    .addUint256(preciseVotingDuration)
    .addBool(isPrivate);
  const createGovernanceDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(governanceDAOFactoryContractId)
    .setFunction(DAOContractFunctions.CreateDAO, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const createGovernanceDAOResponse = await createGovernanceDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createGovernanceDAOResponse, DAOContractFunctions.CreateDAO);
  return createGovernanceDAOResponse;
}

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
    .setFunction(DAOContractFunctions.CreateDAO, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const createMultiSigDAOResponse = await createMultiSigDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createMultiSigDAOResponse, DAOContractFunctions.CreateDAO);
  return createMultiSigDAOResponse;
}

const DAOService = {
  sendCreateGovernanceDAOTransaction,
  sendCreateMultiSigDAOTransaction,
};

export default DAOService;
