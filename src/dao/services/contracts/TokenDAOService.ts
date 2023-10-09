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
import { DAOType, TokenType } from "@dao/services";
import FTDAOFactoryJSON from "@dex/services/abi/FTDAOFactory.json";
import HederaGovernorJSON from "@dex/services/abi/HederaGovernor.json";
import AssetHolderJSON from "@dex/services/abi/AssetHolder.json";
import { isHbarToken } from "@dex/utils";
import { isNFT } from "@shared/utils";
import { GovernanceProposalType } from "@dex/store";

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
  daoFee: number;
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
    daoFee,
  } = params;
  const ftDAOFactoryContractId = ContractId.fromString(Contracts.FTDAOFactory.ProxyId);
  const daoAdminAddress = AccountId.fromString(treasuryWalletAccountId).toSolidityAddress();
  const tokenAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const preciseQuorum = BigNumber(Math.round(quorum * 100)); // Quorum is incremented in 1/100th of percent;
  const preciseLockingDuration = BigNumber(lockingDuration);
  const preciseVotingDuration = BigNumber(votingDuration);
  /* TODO: Replace this with real info url event data */
  const infoUrl = "info-url";

  const createDaoParams: any[] = [
    daoAdminAddress,
    name,
    logoUrl,
    infoUrl,
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
  const tokenAmount = Hbar.from(daoFee, HbarUnit.Tinybar).to(HbarUnit.Hbar).toNumber();
  await DexService.setHbarTokenAllowance({
    walletId: signer.getAccountId().toString(),
    spenderContractId: Contracts.FTDAOFactory.ProxyId,
    tokenAmount,
    signer,
  });

  const createGovernanceDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(ftDAOFactoryContractId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .setPayableAmount(tokenAmount)
    .freezeWithSigner(signer);
  const createGovernanceDAOResponse = await createGovernanceDAOTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(createGovernanceDAOResponse, BaseDAOContractFunctions.CreateDAO);
  return createGovernanceDAOResponse;
}

interface SendProposeTokenTransferTransactionParams {
  tokenId: string;
  governanceTokenId: string;
  title: string;
  spenderContractId: string;
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
    spenderContractId,
    linkToDiscussion,
    tokenType,
    nftSerialId,
    governanceNftTokenSerialId,
    daoType,
  } = params;
  /* NOTE: Metadata is not currently in use for this proposal type. Should be removed from the Smart Contracts */
  const metadata = "";
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const receiverSolidityAddress = AccountId.fromString(receiverId).toSolidityAddress();
  const contractCallParams = new ContractFunctionParameters();
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
  contractCallParams
    .addString(title)
    .addString(description)
    .addString(linkToDiscussion)
    .addString(metadata)
    .addAddress(receiverSolidityAddress);

  if (isHbarToken(tokenId)) {
    preciseAmount = Hbar.from(amount, HbarUnit.Hbar).to(HbarUnit.Tinybar);
    contractCallParams
      .addAddress(ethers.constants.AddressZero)
      .addUint256(preciseAmount)
      .addUint256(governanceNftTokenSerialId);
  } else if (isNFT(tokenType)) {
    contractCallParams.addUint256(nftSerialId).addUint256(governanceNftTokenSerialId);
  } else {
    contractCallParams
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
  spenderContractId: string;
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
    spenderContractId,
    nftTokenSerialId,
    daoType,
    signer,
  } = params;
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
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
  spenderContractId: string;
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
    spenderContractId,
    linkToDiscussion,
    oldProxyAddress,
    newImplementationAddress,
    daoType,
    nftTokenSerialId,
  } = params;
  /* NOTE: Metadata is not currently in use for this proposal type. Should be removed from the Smart Contracts */
  const metadata = "";
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
    .addString(metadata)
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

interface CreateProposalParams {
  governorContractId: string;
  proposalType: number;
  title: string;
  description: string;
  discussionLink: string;
  metadata: string;
  amountOrId: number;
  targets: string[];
  values: number[]; // values must be passed here in a form of tinnybar
  calldatas: Uint8Array[];
  signer: HashConnectSigner;
}

const createProposal = async (params: CreateProposalParams) => {
  const {
    proposalType,
    title,
    description,
    discussionLink,
    metadata,
    amountOrId,
    targets,
    values,
    calldatas,
    governorContractId,
    signer,
  } = params;
  const createProposalInputs = {
    proposalType,
    title,
    description,
    discussionLink,
    metadata,
    amountOrId,
    targets,
    values,
    calldatas,
  };

  const contractInterface = new ethers.utils.Interface(HederaGovernorJSON.abi);
  const data = contractInterface.encodeFunctionData(GovernorDAOContractFunctions.CreateProposal, [
    Object.values(createProposalInputs),
  ]);

  const sendProposeTextProposalTransaction = await new ContractExecuteTransaction()
    .setContractId(governorContractId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .freezeWithSigner(signer);
  const sendProposeTextProposalTransactionResponse = await sendProposeTextProposalTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(
    sendProposeTextProposalTransactionResponse,
    GovernorDAOContractFunctions.CreateProposal
  );
  return sendProposeTextProposalTransactionResponse;
};

interface CreateTextProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  metadata: string;
  nftTokenSerialId: number;
  assetHolderEVMAddress: string;
  governorContractId: string;
  signer: HashConnectSigner;
}

const createTextProposal = async (params: CreateTextProposalParams) => {
  const contractInterface = new ethers.utils.Interface(AssetHolderJSON.abi);
  const data = contractInterface.encodeFunctionData(GovernorDAOContractFunctions.SetText, []);
  const {
    title,
    description,
    linkToDiscussion,
    metadata,
    nftTokenSerialId,
    assetHolderEVMAddress,
    governorContractId,
    signer,
  } = params;

  contractInterface.decodeFunctionData(GovernorDAOContractFunctions.SetText, ethers.utils.arrayify(data));

  return await createProposal({
    proposalType: GovernanceProposalType.SET_TEXT,
    title,
    description,
    discussionLink: linkToDiscussion,
    metadata,
    amountOrId: nftTokenSerialId,
    targets: [assetHolderEVMAddress],
    values: [0],
    calldatas: [ethers.utils.arrayify(data)],
    governorContractId,
    signer,
  });
};

interface SendDAOTextProposalTransactionParams {
  governanceTokenId: string;
  spenderContractId: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  nftTokenSerialId: number;
  metadata: string;
  signer: HashConnectSigner;
  daoType: DAOType;
}

async function sendTextProposalTransaction(params: SendDAOTextProposalTransactionParams) {
  const {
    governanceTokenId,
    signer,
    title,
    description,
    spenderContractId,
    linkToDiscussion,
    nftTokenSerialId,
    metadata,
    daoType,
  } = params;

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
    .addString(metadata)
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

interface SetUpAllowanceParams {
  tokenType: TokenType;
  governanceTokenId: string;
  spenderContractId: string;
  signer: HashConnectSigner;
}
async function setUpAllowance(params: SetUpAllowanceParams) {
  const { tokenType, governanceTokenId, spenderContractId, signer } = params;
  if (tokenType === TokenType.NFT) {
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
}

export {
  sendCreateGovernanceDAOTransaction,
  sendProposeTokenTransferTransaction,
  sendContractUpgradeTransaction,
  sendTextProposalTransaction,
  sendGOVTokenAssociateTransaction,
  createTextProposal,
  setUpAllowance,
};
