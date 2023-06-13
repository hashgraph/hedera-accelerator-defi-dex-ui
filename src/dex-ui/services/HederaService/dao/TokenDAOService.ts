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
import GovernanceDAOFactoryJSON from "../../abi/GovernanceDAOFactory.json";

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
  const governanceDAOFactoryContractId = ContractId.fromString(Contracts.GovernanceDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(treasuryWalletAccountId).toSolidityAddress();
  const tokenAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const preciseQuorum = BigNumber(quorum);
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
  const contractInterface = new ethers.utils.Interface(GovernanceDAOFactoryJSON.abi);
  const data = contractInterface.encodeFunctionData(BaseDAOContractFunctions.CreateDAO, [createDaoParams]);

  const createGovernanceDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(governanceDAOFactoryContractId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .freezeWithSigner(signer);
  const createGovernanceDAOResponse = await createGovernanceDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createGovernanceDAOResponse, BaseDAOContractFunctions.CreateDAO);
  return createGovernanceDAOResponse;
}

interface SendProposeTokenTransferTransaction {
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
  signer: HashConnectSigner;
}

async function sendProposeTokenTransferTransaction(params: SendProposeTokenTransferTransaction) {
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
  } = params;
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const receiverSolidityAddress = AccountId.fromString(receiverId).toSolidityAddress();
  const accountSolidityAddress = signer.getAccountId().toSolidityAddress();
  const preciseAmount = BigNumber(amount).shiftedBy(decimals).integerValue();
  await DexService.setTokenAllowance({
    tokenId: governanceTokenId,
    walletId: signer.getAccountId().toString(),
    spenderContractId: governanceAddress,
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
    .addUint256(preciseAmount);

  const sendProposeTokenTransferTransaction = await new ContractExecuteTransaction()
    .setContractId(daoContractId)
    .setFunction(GovernorDAOContractFunctions.CreateProposal, contractCallParams)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTokenTransferTransactionResponse = await sendProposeTokenTransferTransaction.executeWithSigner(
    signer
  );
  checkTransactionResponseForError(
    sendProposeTokenTransferTransactionResponse,
    GovernorDAOContractFunctions.CreateProposal
  );
  return sendProposeTokenTransferTransactionResponse;
}

export { sendCreateGovernanceDAOTransaction, sendProposeTokenTransferTransaction };
