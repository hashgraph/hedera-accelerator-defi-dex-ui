import { BigNumber } from "bignumber.js";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { ethers } from "ethers";
import {
  AccountId,
  TokenId,
  ContractId,
  ContractExecuteTransaction,
  TransactionResponse,
  TokenMintTransaction,
  ContractFunctionParameters,
  Hbar,
} from "@hashgraph/sdk";
import { BaseDAOContractFunctions, NFTDAOContractFunctions } from "./types";
import { DexService, checkTransactionResponseForError } from "@dex/services";
import { Contracts } from "@dex/services/constants";
import NFTDAOFactoryJSON from "@dex/services/abi/NFTDAOFactory.json";
import { NFTDAOFunctions } from "../types";
import { isHbarToken } from "@dex/utils";
import { DAOConfigDetails } from "@dao/hooks";

const Gas = 9000000;

interface SendCreateNFTDAOTransactionParams {
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  description: string;
  infoUrl: string;
  daoLinks: string[];
  tokenId: string;
  treasuryWalletAccountId: string;
  quorum: number;
  votingDuration: number;
  lockingDuration: number;
  daoFeeConfig: DAOConfigDetails;
  signer: HashConnectSigner;
}
interface MintNFTTokensTransactionParams {
  tokenLinks: string[];
  tokenId: string;
  signer: HashConnectSigner;
}

async function sendCreateNFTDAOTransaction(params: SendCreateNFTDAOTransactionParams): Promise<TransactionResponse> {
  const {
    name,
    logoUrl,
    infoUrl,
    treasuryWalletAccountId,
    tokenId,
    quorum,
    lockingDuration,
    votingDuration,
    isPrivate,
    description,
    daoLinks,
    daoFeeConfig,
    signer,
  } = params;
  const { daoFee, tokenId: daoFeeTokenId, tokenType } = daoFeeConfig;
  const nftDAOFactoryContractId = ContractId.fromString(Contracts.NFTDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(treasuryWalletAccountId).toSolidityAddress();
  const governanceTokenAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const preciseQuorum = BigNumber(Math.round(quorum * 100)); // Quorum is incremented in 1/100th of percent;
  const preciseLockingDuration = BigNumber(lockingDuration);
  const preciseVotingDuration = BigNumber(votingDuration);

  const createDaoParams: any[] = [
    daoAdminAddress,
    name,
    logoUrl,
    infoUrl,
    governanceTokenAddress,
    preciseQuorum.toNumber(),
    preciseLockingDuration.toNumber(),
    preciseVotingDuration.toNumber(),
    isPrivate,
    description,
    daoLinks,
  ];
  const contractInterface = new ethers.utils.Interface(NFTDAOFactoryJSON.abi);
  const data = contractInterface.encodeFunctionData(BaseDAOContractFunctions.CreateDAO, [createDaoParams]);

  const isHbar = isHbarToken(daoFeeTokenId);
  const hBarPayable = Hbar.fromTinybars(isHbar ? daoFee : 0);
  await DexService.setUpAllowance({
    tokenId: daoFeeTokenId,
    tokenAmount: daoFee,
    spenderContractId: Contracts.NFTDAOFactory.ProxyId,
    nftSerialId: daoFee,
    tokenType,
    signer,
  });
  const createNFTDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(nftDAOFactoryContractId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .setPayableAmount(hBarPayable)
    .freezeWithSigner(signer);
  const createGovernanceDAOResponse = await createNFTDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createGovernanceDAOResponse, BaseDAOContractFunctions.CreateDAO);
  return createGovernanceDAOResponse;
}

async function sendMintNFTTokensTransaction(params: MintNFTTokensTransactionParams): Promise<TransactionResponse> {
  const { tokenId, tokenLinks, signer } = params;
  const data = tokenLinks.map((link) => Buffer.from(link));
  const mintNFTTokensTransaction = await new TokenMintTransaction()
    .setMaxTransactionFee(10)
    .setTokenId(tokenId)
    .setMetadata(data)
    .freezeWithSigner(signer);
  const mintNFTTokensResponse = await mintNFTTokensTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(mintNFTTokensResponse, NFTDAOContractFunctions.MintTokens);
  return mintNFTTokensResponse;
}

interface SendLockNFTTokenTransactionParams {
  nftSerialId: number;
  spenderContractId: string;
  signer: HashConnectSigner;
}

const sendLockNFTTokenTransaction = async (params: SendLockNFTTokenTransactionParams) => {
  const { nftSerialId, signer, spenderContractId } = params;
  const godHolderContractId = ContractId.fromString(spenderContractId);
  const contractFunctionParameters = new ContractFunctionParameters().addUint256(nftSerialId);
  const executeSendLockGODTokenTransaction = await new ContractExecuteTransaction()
    .setContractId(godHolderContractId)
    .setFunction(NFTDAOFunctions.GrabTokensFromUser, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);
  const sendLockGODTokenResponse = await executeSendLockGODTokenTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendLockGODTokenResponse, NFTDAOFunctions.GrabTokensFromUser);
  return sendLockGODTokenResponse;
};

interface SendUnLockNFTTokenTransactionParams {
  tokenHolderAddress: string;
  signer: HashConnectSigner;
}

const sendUnLockNFTTokenTransaction = async (params: SendUnLockNFTTokenTransactionParams) => {
  const { signer, tokenHolderAddress } = params;
  const godHolderContractId = ContractId.fromString(tokenHolderAddress);
  const contractFunctionParameters = new ContractFunctionParameters().addUint256(0);
  const executeSendUnLockGODTokenTransaction = await new ContractExecuteTransaction()
    .setContractId(godHolderContractId)
    .setFunction(NFTDAOFunctions.RevertTokensForVoter, contractFunctionParameters)
    .setGas(900000)
    .freezeWithSigner(signer);
  const sendUnLockGODTokenResponse = await executeSendUnLockGODTokenTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(sendUnLockGODTokenResponse, NFTDAOFunctions.RevertTokensForVoter);
  return sendUnLockGODTokenResponse;
};

export {
  sendCreateNFTDAOTransaction,
  sendMintNFTTokensTransaction,
  sendLockNFTTokenTransaction,
  sendUnLockNFTTokenTransaction,
};
