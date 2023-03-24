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

interface SendCreateDAOTransactionParams {
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

async function sendCreateDAOTransaction(params: SendCreateDAOTransactionParams): Promise<TransactionResponse> {
  const governanceDAOFactoryContractId = ContractId.fromString(Contracts.GovernanceDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(params.treasuryWalletAccountId).toSolidityAddress();
  const tokenAddress = TokenId.fromString(params.tokenId).toSolidityAddress();
  const preciseQuorum = BigNumber(params.quorum);
  const preciseLockingDuration = BigNumber(params.lockingDuration);
  const preciseVotingDuration = BigNumber(params.votingDuration);
  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(daoAdminAddress)
    .addString(params.name)
    .addString(params.logoUrl)
    .addAddress(tokenAddress)
    .addUint256(preciseQuorum)
    .addUint256(preciseLockingDuration)
    .addUint256(preciseVotingDuration)
    .addBool(params.isPrivate);
  const createDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(governanceDAOFactoryContractId)
    .setFunction(DAOContractFunctions.CreateDAO, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(params.signer);
  const createDAOResponse = await createDAOTransaction.executeWithSigner(params.signer);
  checkTransactionResponseForError(createDAOResponse, DAOContractFunctions.CreateDAO);
  return createDAOResponse;
}

// Create new function for creating MultiSig DAOs

const DAOService = {
  sendCreateDAOTransaction,
};

export default DAOService;
