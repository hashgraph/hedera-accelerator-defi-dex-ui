import { BigNumber } from "bignumber.js";
import { ethers } from "ethers";
import { HashConnectSigner } from "hashconnect/dist/signer";
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
import { DexService, checkTransactionResponseForError, Contracts } from "@dex/services";
import { DAOType, TokenType } from "@dao/services";
import FTDAOFactoryJSON from "@dex/services/abi/FTDAOFactory.json";
import HederaGovernorJSON from "@dex/services/abi/HederaGovernor.json";
import AssetHolderJSON from "@dex/services/abi/AssetHolder.json";
import { isHbarToken } from "@dex/utils";
import { isNFT } from "@shared/utils";
import { GovernanceProposalType } from "@dex/store";
import { DAOConfigDetails } from "@dao/hooks";
import { isNotNil } from "ramda";

const Gas = 9000000;

interface SendCreateGovernanceDAOTransactionParams {
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

async function sendCreateGovernanceDAOTransaction(
  params: SendCreateGovernanceDAOTransactionParams
): Promise<TransactionResponse> {
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
    signer,
    description,
    daoLinks,
    daoFeeConfig,
  } = params;
  const ftDAOFactoryContractId = ContractId.fromString(Contracts.FTDAOFactory.ProxyId);
  const { tokenId: daoFeeTokenId, daoFee, tokenType } = daoFeeConfig;
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
  const contractInterface = new ethers.utils.Interface(FTDAOFactoryJSON.abi);
  const data = contractInterface.encodeFunctionData(BaseDAOContractFunctions.CreateDAO, [createDaoParams]);

  const isHbar = isHbarToken(daoFeeTokenId);
  const hBarPayable = Hbar.fromTinybars(isHbar ? daoFee : 0);
  await DexService.setUpAllowance({
    tokenId: daoFeeTokenId,
    tokenAmount: daoFee,
    spenderContractId: Contracts.FTDAOFactory.ProxyId,
    nftSerialId: daoFee,
    tokenType,
    signer,
  });
  const createGovernanceDAOTransaction = await new ContractExecuteTransaction()
    .setContractId(ftDAOFactoryContractId)
    .setFunctionParameters(ethers.utils.arrayify(data))
    .setGas(Gas)
    .setPayableAmount(hBarPayable)
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
  const tokenResponse = await DexService.mirrorNodeService.fetchTokenData(governanceTokenId);

  await DexService.setUpAllowance({
    tokenId: governanceTokenId,
    nftSerialId: governanceNftTokenSerialId,
    spenderContractId: governorContractId,
    tokenAmount: tokenResponse.data.precision,
    tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
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
  const tokenResponse = await DexService.mirrorNodeService.fetchTokenData(tokenId);

  await DexService.setUpAllowance({
    tokenId: governanceTokenId,
    nftSerialId: nftTokenSerialId,
    spenderContractId: governorContractId,
    tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
    tokenAmount: tokenResponse.data.precision,
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
  proxyAdmin: string;
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
    proxyAdmin,
    daoType,
    nftTokenSerialId,
  } = params;
  const tokenResponse = await DexService.mirrorNodeService.fetchTokenData(governanceTokenId);

  await DexService.setUpAllowance({
    tokenId: governanceTokenId,
    nftSerialId: nftTokenSerialId,
    spenderContractId: governorContractId,
    tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
    tokenAmount: tokenResponse.data.precision,
    signer,
  });
  const proxyEVMAddress = await DexService.fetchContractEVMAddress(oldProxyAddress);
  const proxyLogicEVMAddress = await DexService.fetchContractEVMAddress(newImplementationAddress);
  const { evm_address: proxyAdminEVMAddress } = await DexService.fetchAccountInfo(proxyAdmin);
  const contractInterface = new ethers.utils.Interface(AssetHolderJSON.abi);
  const data = contractInterface.encodeFunctionData(GovernorDAOContractFunctions.UpgradeProxy, [
    proxyEVMAddress,
    proxyLogicEVMAddress,
    proxyAdminEVMAddress,
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
  const tokenResponse = await DexService.mirrorNodeService.fetchTokenData(params.governanceTokenId);
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
    tokenId: governanceTokenId,
    nftSerialId: nftTokenSerialId,
    spenderContractId: governorContractId,
    tokenAmount: tokenResponse.data.precision,
    tokenType: daoType === DAOType.NFT ? TokenType.NFT : TokenType.FungibleToken,
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
  tokenId: string;
  nftSerialId: number;
  tokenAmount: number;
  tokenType?: string;
  spenderContractId: string;
  signer: HashConnectSigner;
}
async function setUpAllowance(params: SetUpAllowanceParams) {
  const { tokenId, spenderContractId, nftSerialId, signer, tokenAmount, tokenType } = params;
  const walletId = signer.getAccountId().toString();
  const {
    data: { type },
  } = isHbarToken(tokenId)
    ? { data: { type: TokenType.HBAR } }
    : isNotNil(tokenType)
    ? { data: { type: tokenType } }
    : await DexService.fetchTokenData(tokenId);

  switch (type) {
    case TokenType.HBAR: {
      return await DexService.setHbarTokenAllowance({
        walletId,
        spenderContractId,
        tokenAmount,
        signer,
      });
    }
    case TokenType.FungibleToken: {
      return await DexService.setTokenAllowance({
        tokenId,
        walletId,
        spenderContractId,
        tokenAmount,
        signer,
      });
    }
    case TokenType.NFT: {
      return await DexService.setNFTAllowance({
        tokenId,
        nftSerialId,
        walletId,
        spenderContractId,
        signer,
      });
    }
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
