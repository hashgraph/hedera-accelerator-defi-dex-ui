import { BigNumber } from "bignumber.js";
import { ethers } from "ethers";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import {
  AccountId,
  TokenId,
  ContractId,
  ContractExecuteTransaction,
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

interface CreateTokenTransferProposalParams {
  tokenId: string;
  governanceTokenId: string;
  title: string;
  linkToDiscussion: string;
  description: string;
  receiverId: string;
  amount: number;
  decimals: number;
  tokenType: string;
  nftSerialId: number;
  governanceNftTokenSerialId: number;
  governorContractId: string;
  assetHolderEVMAddress: string;
  signer: HashConnectSigner;
  daoType: DAOType;
}

async function createTokenTransferProposal(params: CreateTokenTransferProposalParams) {
  const {
    tokenId,
    governanceTokenId,
    receiverId,
    amount,
    decimals,
    signer,
    title,
    description,
    linkToDiscussion,
    tokenType,
    nftSerialId,
    governorContractId,
    assetHolderEVMAddress,
    governanceNftTokenSerialId,
    daoType,
  } = params;

  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();
  const receiverSolidityAddress = AccountId.fromString(receiverId).toSolidityAddress();
  // const contractCallParams = new ContractFunctionParameters();
  await DexService.setUpAllowance({
    governanceTokenId,
    tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
    spenderContractId: governorContractId,
    signer,
  });
  let transferDetails: string[] = [];
  if (isHbarToken(tokenId)) {
    const preciseAmount = Hbar.from(amount, HbarUnit.Hbar).to(HbarUnit.Tinybar).toString();
    transferDetails = [receiverSolidityAddress, ethers.constants.AddressZero, preciseAmount];
  } else if (isNFT(tokenType)) {
    transferDetails = [receiverSolidityAddress, tokenSolidityAddress, nftSerialId.toString()];
  } else {
    const preciseAmount = BigNumber(amount).shiftedBy(decimals).integerValue().toString();
    transferDetails = [receiverSolidityAddress, tokenSolidityAddress, preciseAmount];
  }

  const contractInterface = new ethers.utils.Interface(AssetHolderJSON.abi);
  const data = contractInterface.encodeFunctionData(GovernorDAOContractFunctions.TRANSFER, transferDetails);

  return await createProposal({
    proposalType: GovernanceProposalType.TRANSFER,
    title,
    description,
    discussionLink: linkToDiscussion,
    metadata: "",
    amountOrId: governanceNftTokenSerialId,
    targets: [assetHolderEVMAddress],
    values: [0],
    calldatas: [ethers.utils.arrayify(data)],
    governorContractId,
    signer,
  });
}

interface CreateTokenAssociationProposalParams {
  title: string;
  description: string;
  linkToDiscussion: string;
  tokenId: string;
  governanceTokenId: string;
  governorContractId: string;
  assetHolderEVMAddress: string;
  nftTokenSerialId: number;
  daoType: DAOType;
  signer: HashConnectSigner;
}

async function createGOVTokenAssociateProposal(params: CreateTokenAssociationProposalParams) {
  const {
    title,
    description,
    linkToDiscussion,
    tokenId,
    governanceTokenId,
    governorContractId,
    assetHolderEVMAddress,
    nftTokenSerialId,
    daoType,
    signer,
  } = params;
  const tokenSolidityAddress = TokenId.fromString(tokenId).toSolidityAddress();

  await DexService.setUpAllowance({
    governanceTokenId,
    tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
    spenderContractId: governorContractId,
    signer,
  });
  const contractInterface = new ethers.utils.Interface(AssetHolderJSON.abi);
  const data = contractInterface.encodeFunctionData(GovernorDAOContractFunctions.Associate, [tokenSolidityAddress]);

  return await createProposal({
    proposalType: GovernanceProposalType.ASSOCIATE,
    title,
    description,
    discussionLink: linkToDiscussion,
    metadata: "",
    amountOrId: nftTokenSerialId,
    targets: [assetHolderEVMAddress],
    values: [0],
    calldatas: [ethers.utils.arrayify(data)],
    governorContractId,
    signer,
  });
}
interface CreateUpgradeProxyProposalParams {
  governanceTokenId: string;
  governorContractId: string;
  assetHolderEVMAddress: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  newImplementationAddress: string;
  oldProxyAddress: string;
  nftTokenSerialId: number;
  daoType: string;
  signer: HashConnectSigner;
}

async function createUpgradeProxyProposal(params: CreateUpgradeProxyProposalParams) {
  const {
    governanceTokenId,
    signer,
    title,
    description,
    governorContractId,
    assetHolderEVMAddress,
    linkToDiscussion,
    oldProxyAddress,
    newImplementationAddress,
    daoType,
    nftTokenSerialId,
  } = params;

  await DexService.setUpAllowance({
    governanceTokenId,
    tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
    spenderContractId: governorContractId,
    signer,
  });
  const proxyEVMAddress = await DexService.fetchContractEVMAddress(oldProxyAddress);
  const proxyLogicEVMAddress = await DexService.fetchContractEVMAddress(newImplementationAddress);
  //TODO: add proxy admin input in the create proposal form
  const proxyAdmin = "0x00000000000000000000000000000000000132e7";

  const contractInterface = new ethers.utils.Interface(AssetHolderJSON.abi);
  const data = contractInterface.encodeFunctionData(GovernorDAOContractFunctions.UpgradeProxy, [
    proxyEVMAddress,
    proxyLogicEVMAddress,
    proxyAdmin,
  ]);

  return await createProposal({
    proposalType: GovernanceProposalType.UPGRADE_PROXY,
    title,
    description,
    discussionLink: linkToDiscussion,
    metadata: "",
    amountOrId: nftTokenSerialId,
    targets: [assetHolderEVMAddress],
    values: [0],
    calldatas: [ethers.utils.arrayify(data)],
    governorContractId,
    signer,
  });
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
  governanceTokenId: string;
  governorContractId: string;
  assetHolderEVMAddress: string;
  nftTokenSerialId: number;
  daoType: DAOType;
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
    governanceTokenId,
    governorContractId,
    assetHolderEVMAddress,
    nftTokenSerialId,
    daoType,
    signer,
  } = params;
  await DexService.setUpAllowance({
    governanceTokenId,
    tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
    spenderContractId: governorContractId,
    signer,
  });

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
  createTextProposal,
  createGOVTokenAssociateProposal,
  createTokenTransferProposal,
  createUpgradeProxyProposal,
  setUpAllowance,
};
