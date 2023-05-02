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
import { BaseDAOContractFunctions } from "./type";
import { checkTransactionResponseForError } from "../utils";
import { Contracts } from "../../constants";

const Gas = 9000000;

interface SendCreateNFTDAOTransactionParams {
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

async function sendCreateNFTDAOTransaction(params: SendCreateNFTDAOTransactionParams): Promise<TransactionResponse> {
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
  const nftDAOFactoryContractId = ContractId.fromString(Contracts.NFTDAOFactory.ProxyId);
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
  const createNFTDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(nftDAOFactoryContractId)
    .setFunction(BaseDAOContractFunctions.CreateDAO, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const createGovernanceDAOResponse = await createNFTDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createGovernanceDAOResponse, BaseDAOContractFunctions.CreateDAO);
  return createGovernanceDAOResponse;
}

export { sendCreateNFTDAOTransaction };
