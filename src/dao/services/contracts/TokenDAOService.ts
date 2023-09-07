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
  TokenType,
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
  tokenType: string;
  nftSerialId: number;
  governanceNftTokenSerialId: number;
  signer: HashConnectSigner;
  daoType: DAOType;
}

async function sendProposeTokenTransferTransaction(params: SendProposeTokenTransferTransactionParams) {
  const {
    tokenId,
    governanceTokenId,
    receiverId,
    amount,
    decimals,
    signer,
    title,
    description,
    governanceAddress,
    linkToDiscussion,
    tokenType,
    nftSerialId,
    governanceNftTokenSerialId,
    daoType,
  } = params;
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const receiverSolidityAddress = AccountId.fromString(receiverId).toSolidityAddress();
  const contractCallParams = new ContractFunctionParameters();
  const spenderContractId = AccountId.fromSolidityAddress(governanceAddress).toString();
  let preciseAmount = BigNumber(amount).shiftedBy(decimals).integerValue();
  switch (daoType) {
    case DAOType.NFT: {
      await DexService.setNFTAllowance({
        nftId: governanceTokenId,
        walletId: signer.getAccountId().toString(),
        spenderContractId,
        signer,
      });
      break;
    }
    case DAOType.GovernanceToken: {
      await DexService.setTokenAllowance({
        tokenId: governanceTokenId,
        walletId: signer.getAccountId().toString(),
        spenderContractId,
        tokenAmount: 1 * DEX_PRECISION,
        signer,
      });
      break;
    }
    default:
      break;
  }
  if (isHbarToken(tokenId)) {
    preciseAmount = Hbar.from(amount, HbarUnit.Hbar).to(HbarUnit.Tinybar);
    contractCallParams
      .addString(title)
      .addString(description)
      .addString(linkToDiscussion)
      .addAddress(receiverSolidityAddress)
      .addAddress(ethers.constants.AddressZero)
      .addUint256(preciseAmount)
      .addUint256(governanceNftTokenSerialId);
  } else if (tokenType === TokenType.NonFungibleUnique.toString()) {
    contractCallParams
      .addString(title)
      .addString(description)
      .addString(linkToDiscussion)
      .addAddress(receiverSolidityAddress)
      .addAddress(tokenSolidityAddress)
      .addUint256(nftSerialId)
      .addUint256(governanceNftTokenSerialId);
  } else {
    contractCallParams
      .addString(title)
      .addString(description)
      .addString(linkToDiscussion)
      .addAddress(receiverSolidityAddress)
      .addAddress(tokenSolidityAddress)
      .addUint256(preciseAmount)
      .addUint256(governanceNftTokenSerialId);
  }
  const sendProposeTokenTransferTransaction = await new ContractExecuteTransaction()
    .setContractId(spenderContractId)
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

interface TokenAssociateTransactionParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  tokenId: string;
  governanceTokenId: string;
  governanceAddress: string;
  nftTokenSerialId: number;
  daoType: DAOType;
  signer: HashConnectSigner;
}

async function sendGOVTokenAssociateTransaction(params: TokenAssociateTransactionParams) {
  const {
    title,
    description,
    linkToDiscussion,
    tokenId,
    governanceTokenId,
    governanceAddress,
    nftTokenSerialId,
    daoType,
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
  switch (daoType) {
    case DAOType.NFT: {
      await DexService.setNFTAllowance({
        nftId: governanceTokenId,
        walletId: signer.getAccountId().toString(),
        spenderContractId,
        signer,
      });
      break;
    }
    case DAOType.GovernanceToken: {
      await DexService.setTokenAllowance({
        tokenId: governanceTokenId,
        walletId: signer.getAccountId().toString(),
        spenderContractId,
        tokenAmount,
        signer,
      });
      break;
    }
    default:
      break;
  }
  const sendProposeTokenAssociationTransaction = await new ContractExecuteTransaction()
    .setContractId(spenderContractId)
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
  nftTokenSerialId: number;
  daoType: string;
  signer: HashConnectSigner;
}
async function sendContractUpgradeTransaction(params: SendDAOContractUpgradeProposalTransactionParams) {
  const {
    governanceTokenId,
    signer,
    title,
    description,
    governanceAddress,
    linkToDiscussion,
    oldProxyAddress,
    newImplementationAddress,
    daoType,
    nftTokenSerialId,
  } = params;
  const spenderContractId = AccountId.fromSolidityAddress(governanceAddress).toString();
  const proxyEVMAddress = await DexService.fetchContractEVMAddress(oldProxyAddress);
  const proxyLogicEVMAddress = await DexService.fetchContractEVMAddress(newImplementationAddress);

  switch (daoType) {
    case DAOType.NFT: {
      await DexService.setNFTAllowance({
        nftId: governanceTokenId,
        walletId: signer.getAccountId().toString(),
        spenderContractId,
        signer,
      });
      break;
    }
    case DAOType.GovernanceToken: {
      await DexService.setTokenAllowance({
        tokenId: governanceTokenId,
        walletId: signer.getAccountId().toString(),
        spenderContractId,
        tokenAmount: 1 * DEX_PRECISION,
        signer,
      });
      break;
    }
    default:
      break;
  }

  const contractCallParams = new ContractFunctionParameters()
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addAddress(proxyEVMAddress)
    .addAddress(proxyLogicEVMAddress)
    .addUint256(nftTokenSerialId);

  const sendProposeTokenTransferTransaction = await new ContractExecuteTransaction()
    .setContractId(spenderContractId)
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

interface SendDAOTextProposalTransactionParams {
  governanceTokenId: string;
  governanceAddress: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  nftTokenSerialId: number;
  signer: HashConnectSigner;
  daoType: DAOType;
}

async function sendTextProposalTransaction(params: SendDAOTextProposalTransactionParams) {
  const {
    governanceTokenId,
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
    .setContractId(spenderContractId)
    .setFunction(GovernorDAOContractFunctions.CreateProposal, contractCallParams)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTextProposalTransactionResponse = await sendProposeTextProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(
    sendProposeTextProposalTransactionResponse,
    GovernorDAOContractFunctions.CreateProposal
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
