import { BigNumber } from "bignumber.js";
import { ethers } from "ethers";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { AccountId, TokenId, ContractId, ContractExecuteTransaction, TransactionResponse, Hbar } from "@hashgraph/sdk";
import { BaseDAOContractFunctions, GovernorDAOContractFunctions } from "./types";
import { DexService, checkTransactionResponseForError, Contracts } from "@dex/services";
import { DAOType, TokenType } from "@dao/services";
import FTDAOFactoryJSON from "@dex/services/abi/FTDAOFactory.json";
import HederaGovernorJSON from "@dex/services/abi/HederaGovernor.json";
import AssetHolderJSON from "@dex/services/abi/AssetHolder.json";
import { isHbarToken } from "@dex/utils";
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

interface CreateGovernanceProposalParams {
  governorContractId: string;
  governanceTokenId?: string;
  nftTokenSerialId?: number;
  daoType?: string;
  proposalType: number;
  title: string;
  description: string;
  discussionLink?: string;
  metadata?: string;
  amountOrId: number;
  target: string;
  calldata: string;
  signer: HashConnectSigner;
}

async function createGovernanceProposal(params: CreateGovernanceProposalParams) {
  const {
    governanceTokenId,
    signer,
    title,
    description,
    governorContractId,
    target,
    discussionLink = "",
    daoType,
    nftTokenSerialId = 0,
    calldata,
    proposalType,
    metadata = "",
    amountOrId = 0,
  } = params;

  if (governanceTokenId) {
    const tokenResponse = await DexService.mirrorNodeService.fetchTokenData(governanceTokenId);
    await DexService.setUpAllowance({
      tokenId: governanceTokenId,
      nftSerialId: nftTokenSerialId,
      spenderContractId: governorContractId,
      tokenAmount: tokenResponse.data.precision,
      tokenType: daoType === (DAOType as any).NFT ? TokenType.NFT : TokenType.FungibleToken,
      signer,
    });
  }

  return await createProposal({
    proposalType,
    title,
    description,
    discussionLink,
    metadata,
    amountOrId,
    targets: [target],
    values: [0],
    calldatas: [ethers.utils.arrayify(calldata)],
    governorContractId,
    signer,
  });
}

async function sendHuffyRiskParametersProposal(params: any) {
  return createGovernanceProposal({ ...params, proposalType: GovernanceProposalType.RiskParametersProposal });
}

async function sendHuffyAddTradingPairProposal(params: any) {
  return createGovernanceProposal({ ...params, proposalType: GovernanceProposalType.AddTradingPairProposal });
}

async function sendHuffyRemoveTradingPairProposal(params: any) {
  return createGovernanceProposal({ ...params, proposalType: GovernanceProposalType.RemoveTradingPairProposal });
}

export {
  sendCreateGovernanceDAOTransaction,
  createTextProposal,
  setUpAllowance,
  sendHuffyRiskParametersProposal,
  sendHuffyAddTradingPairProposal,
  sendHuffyRemoveTradingPairProposal,
};
