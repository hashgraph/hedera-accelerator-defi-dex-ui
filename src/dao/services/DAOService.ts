import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { AccountId, ContractExecuteTransaction, ContractFunctionParameters, ContractId } from "@hashgraph/sdk";
import {
  abiSignatures,
  checkTransactionResponseForError,
  Contracts,
  convertEthersBigNumberToBigNumberJS,
  decodeLog,
  DexService,
  Gas,
  HBARTokenId,
  MINIMUM_DEPOSIT_AMOUNT,
  MirrorNodeDecodedProposalEvent,
} from "@dex/services";
import { getEventArgumentsByName } from "../../dex/services/utils";
import FTDAOFactoryJSON from "../../dex/services/abi/FTDAOFactory.json";
import HederaGnosisSafeJSON from "../../dex/services/abi/HederaGnosisSafe.json";
import MultiSigDAOJSON from "../../dex/services/abi/MultiSigDAO.json";
import BaseDAOJSON from "../../dex/services/abi/BaseDAO.json";
import HederaGovernorJSON from "../../dex/services/abi/HederaGovernor.json";
import AssetHolderJSON from "../../dex/services/abi/AssetHolder.json";
import GODHolderJSON from "../../dex/services/abi/GODHolder.json";
import ParameterStoreJSON from "../../dao/config/abi/ParameterStore.json";
import PairWhitelistJSON from "../../dao/config/abi/PairWhitelist.json";

import {
  DAO,
  DAODetailsInfoEventArgs,
  DAOEvents,
  DAOSettingsDetails,
  DAOType,
  GovernanceDAOCreatedEventArgs,
  GovernanceDAODetails,
  HederaGnosisSafeFunctions,
  LockedTokenDetails,
  MultiSigProposeTransactionType,
  ProposalDataDetails,
  UpgradeContractDetails,
} from "./types";
import { HashConnectSigner } from "hashconnect/dist/signer";
import { convertNumberToPercentage, convertToByte32 } from "@dex/utils";
import { ProposalData } from "../../dex/services/DexService/governance/type";
import { isNil, isNotNil } from "ramda";
import { ContractProposalState, GovernanceProposalType } from "@dex/store";
import { solidityAddressToAccountIdString, solidityAddressToTokenIdString } from "@shared/utils";
import { GovernorDAOContractFunctions } from "./contracts";

export async function getVotingPower(callContract: string, owner: string) {
  const contractInterface = new ethers.utils.Interface(GODHolderJSON.abi);
  const response = await DexService.callContract({
    data: contractInterface.encodeFunctionData("balanceOfVoter", [owner]),
    from: owner,
    to: callContract,
  });

  const balance = contractInterface.decodeFunctionResult("balanceOfVoter", ethers.utils.arrayify(response.data.result));
  return balance[0].toNumber();
}

async function fetchDAOSettingsPageDetails(
  accountId: string,
  eventTypes?: string[]
): Promise<DAOSettingsDetails | undefined> {
  const log = await DexService.fetchParsedEventLogs(accountId, new ethers.utils.Interface(BaseDAOJSON.abi), eventTypes);
  if (log[0] === undefined) {
    return undefined;
  }
  const argsWithName = getEventArgumentsByName<DAODetailsInfoEventArgs>(log[0].args.daoInfo, ["webLinks"]);
  const { name, logoUrl, description, webLinks, infoUrl } = argsWithName;

  return {
    name,
    logoUrl,
    description,
    webLinks,
    infoUrl,
  };
}

async function fetchGovernanceDAOs(eventTypes?: string[]): Promise<GovernanceDAODetails[]> {
  const logs = await DexService.fetchParsedEventLogs(
    Contracts.FTDAOFactory.ProxyId,
    new ethers.utils.Interface(FTDAOFactoryJSON.abi),
    eventTypes
  );
  const allPromises = logs.map(async (log): Promise<GovernanceDAODetails> => {
    const argsWithName = getEventArgumentsByName<GovernanceDAOCreatedEventArgs>(log.args, ["webLinks"]);

    const {
      daoAddress: accountId,
      assetsHolderAddress,
      governorAddress,
      tokenHolderAddress,
      inputs: initialDAODetails,
    } = argsWithName;
    const {
      admin,
      isPrivate,
      tokenAddress,
      quorumThreshold,
      votingDelay,
      votingPeriod,
      name,
      logoUrl,
      infoUrl,
      webLinks,
      description,
    } = initialDAODetails;

    const tokenHolderEvents = await DexService.fetchUpgradeContractEvents(tokenHolderAddress, ["UpdatedAmount"]);
    const lockedTokenDetails: LockedTokenDetails[] = tokenHolderEvents?.get("UpdatedAmount") ?? [];
    const updatedDAODetails = await fetchDAOSettingsPageDetails(accountId, [DAOEvents.DAOInfoUpdated]);

    let tokenId;
    try {
      tokenId = solidityAddressToTokenIdString(tokenAddress);
    } catch (error) {
      tokenId = (await DexService.fetchContractId(tokenAddress)).toString();
    }

    return {
      type: DAOType.GovernanceToken,
      accountEVMAddress: accountId,
      adminId: solidityAddressToAccountIdString(admin),
      name: updatedDAODetails?.name ?? name,
      logoUrl: updatedDAODetails?.logoUrl ?? logoUrl,
      infoUrl: updatedDAODetails?.infoUrl ?? infoUrl,
      isPrivate,
      title: updatedDAODetails?.name ?? name,
      webLinks: updatedDAODetails?.webLinks ?? webLinks,
      description: updatedDAODetails?.description ?? description,
      governorAddress,
      assetsHolderAddress,
      tokenHolderAddress,
      tokenId: tokenId,
      quorumThreshold: convertNumberToPercentage(quorumThreshold.toNumber()),
      votingDelay: votingDelay.toNumber(),
      votingPeriod: votingPeriod.toNumber(),
      minimumProposalDeposit: MINIMUM_DEPOSIT_AMOUNT,
      lockedTokenDetails,
    };
  });

  return await Promise.all(allPromises);
}

export async function fetchAllDAOs(): Promise<DAO[]> {
  const daos = await Promise.all([fetchGovernanceDAOs([DAOEvents.DAOCreated])]);
  return daos.flat();
}

function getProposalData(type: GovernanceProposalType, data: string | undefined): ProposalDataDetails {
  const contractInterface = new ethers.utils.Interface(AssetHolderJSON.abi);
  const getUpgradeContractProposalData = (data: string | undefined) => {
    if (isNil(data)) return;
    const parsedData = contractInterface.decodeFunctionData(
      GovernorDAOContractFunctions.UpgradeProxy,
      ethers.utils.arrayify(data)
    );
    return {
      type: GovernanceProposalType.UPGRADE_PROXY,
      proxy: parsedData._proxy,
      proxyAdmin: parsedData._proxyAdmin,
      proxyLogic: parsedData._proxyLogic,
    };
  };

  const getTokenTransferProposalDataFromHexData = (data: string | undefined) => {
    if (isNil(data)) return;
    const parsedData = contractInterface.decodeFunctionData(
      GovernorDAOContractFunctions.TRANSFER,
      ethers.utils.arrayify(data)
    );
    return {
      type: GovernanceProposalType.TRANSFER,
      transferToAccount: solidityAddressToAccountIdString(parsedData.to),
      tokenToTransfer:
        parsedData.token === ethers.constants.AddressZero
          ? HBARTokenId
          : solidityAddressToTokenIdString(parsedData.token),
      transferTokenAmount: convertEthersBigNumberToBigNumberJS(parsedData.amount).toNumber(),
    };
  };

  const getAssociateProposalDataFromHexData = (data: string | undefined) => {
    if (isNil(data)) return;
    const parsedData = contractInterface.decodeFunctionData(
      GovernorDAOContractFunctions.Associate,
      ethers.utils.arrayify(data)
    );
    return {
      type: GovernanceProposalType.ASSOCIATE,
      tokenAddress: parsedData._token,
    };
  };

  const getHuffyRiskParamsProposalDataFromHexData = (data: string | undefined) => {
    if (isNil(data)) return;

    const contractInterface = new ethers.utils.Interface(ParameterStoreJSON.abi);
    const parsedData = contractInterface.decodeFunctionData("setParameters", ethers.utils.arrayify(data));
    return {
      type: GovernanceProposalType.RiskParametersProposal,
      maxTradeBps: Number(parsedData.newMaxTradeBps),
      maxSlippageBps: Number(parsedData.newMaxSlippageBps),
      tradeCooldownSec: Number(parsedData.newTradeCooldownSec),
    };
  };

  const getHuffyAddTraidingPairProposalDataFromHexData = (data: string | undefined) => {
    if (isNil(data)) return;

    const contractInterface = new ethers.utils.Interface(PairWhitelistJSON.abi);
    const parsedData = contractInterface.decodeFunctionData("addPair", ethers.utils.arrayify(data));
    return {
      type: GovernanceProposalType.AddTradingPairProposal,
      tokenIn: parsedData.tokenIn,
      tokenOut: parsedData.tokenOut,
    };
  };

  const getHuffyRemoveTraidingPairProposalDataFromHexData = (data: string | undefined) => {
    if (isNil(data)) return;

    const contractInterface = new ethers.utils.Interface(PairWhitelistJSON.abi);
    const parsedData = contractInterface.decodeFunctionData("removePair", ethers.utils.arrayify(data));
    return {
      type: GovernanceProposalType.RemoveTradingPairProposal,
      tokenIn: parsedData.tokenIn,
      tokenOut: parsedData.tokenOut,
    };
  };

  switch (Number(type)) {
    case GovernanceProposalType.TRANSFER:
      return getTokenTransferProposalDataFromHexData(data);
    case GovernanceProposalType.ASSOCIATE:
      return getAssociateProposalDataFromHexData(data);
    case GovernanceProposalType.UPGRADE_PROXY:
      return getUpgradeContractProposalData(data);
    case GovernanceProposalType.RiskParametersProposal:
      return getHuffyRiskParamsProposalDataFromHexData(data);
    case GovernanceProposalType.AddTradingPairProposal:
      return getHuffyAddTraidingPairProposalDataFromHexData(data);
    case GovernanceProposalType.RemoveTradingPairProposal:
      return getHuffyRemoveTraidingPairProposalDataFromHexData(data);
    default:
      return;
  }
}

export async function fetchGovernanceDAOLogs(governorAddress: string): Promise<ProposalData[]> {
  const contractInterface = new ethers.utils.Interface(HederaGovernorJSON.abi);

  const fetchDAOProposalEvents = async (): Promise<MirrorNodeDecodedProposalEvent[]> => {
    return await DexService.fetchContractProposalEvents(governorAddress);
  };

  const fetchDAOProposalData = async (proposalEvents: MirrorNodeDecodedProposalEvent[]): Promise<ProposalData[]> => {
    const proposalEventsWithDetailsResults = await Promise.allSettled(
      proposalEvents.map(async (proposalEvent: MirrorNodeDecodedProposalEvent) => {
        try {
          const proposalDetailsData = getProposalData(
            proposalEvent.coreInformation.inputs.proposalType,
            proposalEvent.coreInformation.inputs.calldatas?.[0]
          );

          let contractId = proposalEvent.contractId;
          if (contractId.includes("0.0")) {
            contractId = ContractId.fromString(contractId).toSolidityAddress();
          }

          const response = await DexService.callContract({
            data: contractInterface.encodeFunctionData("state", [proposalEvent.proposalId]),
            // from: contractId.toString(),
            to: contractId.toString(),
          });

          if (!response?.data?.result) {
            console.warn(`No callContract result for proposalId=${proposalEvent.proposalId}, contract=${contractId}`);
            return {
              ...proposalEvent,
              ...proposalDetailsData,
            };
          }

          let dataParsed;
          try {
            dataParsed = contractInterface.decodeFunctionResult("state", ethers.utils.arrayify(response.data.result));
          } catch (err) {
            console.error(`Failed to decode state for proposalId=${proposalEvent.proposalId}`, err);
            return {
              ...proposalEvent,
              ...proposalDetailsData,
            };
          }
          const isContractUpgradeProposal =
            Number(proposalEvent.coreInformation.inputs.proposalType) === GovernanceProposalType.UPGRADE_PROXY;

          let isAdminApproved = false;
          let parsedData;
          if (isContractUpgradeProposal && isNotNil(proposalDetailsData)) {
            const proposalData = proposalDetailsData as UpgradeContractDetails;
            const logs = await DexService.fetchContractLogs(proposalData?.proxy ?? "");
            const allEvents = decodeLog(abiSignatures, logs, [DAOEvents.ChangeAdmin, DAOEvents.Upgraded]);
            const changeAdminLogs = allEvents.get(DAOEvents.ChangeAdmin) ?? [];
            const upgradedLogs = allEvents.get(DAOEvents.Upgraded) ?? [];
            const currentLogic = isNotNil(upgradedLogs[0])
              ? (await DexService.fetchContractId(upgradedLogs[0].implementation)).toString()
              : "";
            const proxyAdmin = solidityAddressToAccountIdString(proposalData?.proxyAdmin);
            const proxyLogic = (await DexService.fetchContractId(proposalData.proxyLogic)).toString();
            const latestAdminLog = isNotNil(changeAdminLogs[0]) ? changeAdminLogs[0] : "";
            isAdminApproved =
              latestAdminLog?.newAdmin?.toLocaleLowerCase() === (proposalEvent.contractId ?? "").toLocaleLowerCase() ||
              (proposalEvent.contractId?.includes("0.0") &&
                latestAdminLog?.newAdmin?.toLocaleLowerCase() === proposalEvent.contractId.toLocaleLowerCase());
            parsedData = { ...proposalDetailsData, currentLogic, proxyAdmin, proxyLogic };
          }

          const firstStateValue = Array.isArray(dataParsed) ? dataParsed.at(0) : undefined;

          const isAdminApprovalButtonVisible =
            firstStateValue === ContractProposalState.Succeeded && !isAdminApproved && isContractUpgradeProposal;

          const currentStateOfProposal = isContractUpgradeProposal
            ? firstStateValue === ContractProposalState.Succeeded && !isAdminApproved
              ? ContractProposalState.Active
              : firstStateValue
            : firstStateValue;

          return {
            ...proposalEvent,
            state: currentStateOfProposal,
            ...proposalDetailsData,
            ...parsedData,
            isAdminApproved,
            isAdminApprovalButtonVisible,
          };
        } catch (err) {
          console.error(`Error processing proposal ${proposalEvent?.proposalId ?? "<unknown>"}:`, err);
          return undefined;
        }
      })
    );

    return proposalEventsWithDetailsResults
      .map((r) => (r.status === "fulfilled" ? r.value : undefined))
      .filter((v): v is ProposalData => v !== undefined);
  };
  const proposalEvents = await fetchDAOProposalEvents();

  return await fetchDAOProposalData(proposalEvents);
}

export async function fetchHederaGnosisSafeLogs(safeAccountId: string) {
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  return DexService.fetchParsedEventLogs(safeAccountId, contractInterface);
}

export interface ProposeAddOwnerWithThresholdParams {
  safeEVMAddress: string;
  newMemberAddress: string;
  multiSigDAOContractId: string;
  threshold: number;
  title: string;
  description: string;
  signer: HashConnectSigner;
}

export async function proposeAddOwnerWithThreshold(params: ProposeAddOwnerWithThresholdParams) {
  const { newMemberAddress, threshold, safeEVMAddress, multiSigDAOContractId, signer, title, description } = params;
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const newOwnerData = contractInterface.encodeFunctionData("addOwnerWithThreshold", [
    AccountId.fromString(newMemberAddress).toSolidityAddress(),
    threshold,
  ]);

  return DexService.sendProposeTransaction({
    safeEVMAddress,
    data: newOwnerData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.AddMember,
    title,
    description,
    signer,
  });
}

export interface ProposeRemoveOwnerWithThresholdParams {
  safeEVMAddress: string;
  memberAddress: string;
  prevMemberAddress: string;
  title: string;
  description: string;
  multiSigDAOContractId: string;
  threshold: number;
  signer: HashConnectSigner;
}

export async function proposeRemoveOwnerWithThreshold(params: ProposeRemoveOwnerWithThresholdParams) {
  const {
    memberAddress,
    threshold,
    safeEVMAddress,
    multiSigDAOContractId,
    signer,
    title,
    description,
    prevMemberAddress,
  } = params;
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const removeOwnerData = contractInterface.encodeFunctionData("removeOwner", [
    AccountId.fromString(prevMemberAddress).toSolidityAddress(),
    AccountId.fromString(memberAddress).toSolidityAddress(),
    threshold,
  ]);

  return DexService.sendProposeTransaction({
    safeEVMAddress,
    data: removeOwnerData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.DeleteMember,
    title,
    description,
    signer,
  });
}

export interface ProposeSwapOwnerWithThresholdParams {
  safeEVMAddress: string;
  oldMemberAddress: string;
  prevMemberAddress: string;
  title: string;
  description: string;
  newMemberAddress: string;
  multiSigDAOContractId: string;
  signer: HashConnectSigner;
}

export async function proposeSwapOwnerWithThreshold(params: ProposeSwapOwnerWithThresholdParams) {
  const {
    newMemberAddress,
    safeEVMAddress,
    multiSigDAOContractId,
    oldMemberAddress,
    signer,
    title,
    description,
    prevMemberAddress,
  } = params;
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const removeOwnerData = contractInterface.encodeFunctionData("swapOwner", [
    AccountId.fromString(prevMemberAddress).toSolidityAddress(),
    AccountId.fromString(oldMemberAddress).toSolidityAddress(),
    AccountId.fromString(newMemberAddress).toSolidityAddress(),
  ]);

  return DexService.sendProposeTransaction({
    safeEVMAddress,
    data: removeOwnerData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.ReplaceMember,
    title,
    description,
    signer,
  });
}

export interface ProposeChangeThresholdParams {
  safeEVMAddress: string;
  title: string;
  description: string;
  threshold: number;
  multiSigDAOContractId: string;
  signer: HashConnectSigner;
}

export async function proposeChangeThreshold(params: ProposeChangeThresholdParams) {
  const { safeEVMAddress, multiSigDAOContractId, threshold, signer, title, description } = params;
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const changeThresholdData = contractInterface.encodeFunctionData("changeThreshold", [threshold]);

  return DexService.sendProposeTransaction({
    safeEVMAddress,
    data: changeThresholdData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.ChangeThreshold,
    title,
    description,
    signer,
  });
}

export interface ProposeMultiSigTextProposalParams {
  safeEVMAddress: string;
  multiSigDAOContractId: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  metadata: string;
  signerAccountId: string;
  signer: HashConnectSigner;
}

export async function proposeMultiSigTextProposal(params: ProposeMultiSigTextProposalParams) {
  const {
    safeEVMAddress,
    multiSigDAOContractId,
    signer,
    title,
    description,
    signerAccountId,
    linkToDiscussion,
    metadata,
  } = params;
  const contractInterface = new ethers.utils.Interface(MultiSigDAOJSON.abi);
  const textProposalData = contractInterface.encodeFunctionData("setText", [
    AccountId.fromString(signerAccountId).toSolidityAddress(),
    title,
  ]);

  return DexService.sendProposeTransaction({
    safeEVMAddress,
    data: textProposalData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.TypeSetText,
    title,
    description,
    linkToDiscussion,
    metadata,
    signer,
  });
}

export async function sendApproveMultiSigTransaction(
  safeId: string,
  transactionHash: string,
  signer: HashConnectSigner
) {
  const safeContractId = await DexService.fetchContractId(safeId);
  const utf8BytesTransactionHash = convertToByte32(transactionHash);
  const contractFunctionParameters = new ContractFunctionParameters().addBytes32(utf8BytesTransactionHash);
  const approveMultiSigTransaction = await new ContractExecuteTransaction()
    .setContractId(safeContractId)
    .setFunction(HederaGnosisSafeFunctions.ApproveHash, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const approveMultiSigTransactionResponse = await approveMultiSigTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(approveMultiSigTransactionResponse, HederaGnosisSafeFunctions.ApproveHash);
  return approveMultiSigTransactionResponse;
}

export async function sendChangeAdminForProposalTransaction(
  safeId: string,
  proxyAddress: string,
  signer: HashConnectSigner
) {
  const safeAddress = await DexService.fetchContractEVMAddress(safeId);
  const proxyContractId = await DexService.fetchContractId(proxyAddress);
  const contractFunctionParameters = new ContractFunctionParameters().addAddress(safeAddress);
  const changeAdminTransaction = await new ContractExecuteTransaction()
    .setContractId(proxyContractId)
    .setFunction("changeAdmin", contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const changeAdminTransactionResponse = await changeAdminTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(changeAdminTransactionResponse, HederaGnosisSafeFunctions.ApproveHash);
  return changeAdminTransactionResponse;
}

export interface SendTransferOwnershipTransactionParams {
  newOwnerEVMAddress: string;
  targetAddress: string;
  signer: HashConnectSigner;
}
export async function sendTransferOwnershipTransaction(params: SendTransferOwnershipTransactionParams) {
  const { newOwnerEVMAddress, targetAddress, signer } = params;
  const targetContractId = await DexService.fetchContractId(targetAddress);
  const contractFunctionParameters = new ContractFunctionParameters().addAddress(newOwnerEVMAddress);
  const transferOwnershipTransaction = await new ContractExecuteTransaction()
    .setContractId(targetContractId)
    .setFunction(HederaGnosisSafeFunctions.ChangeFeeConfigController, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);
  const transferOwnershipTransactionResponse = await transferOwnershipTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(
    transferOwnershipTransactionResponse,
    HederaGnosisSafeFunctions.ChangeFeeConfigController
  );
  return transferOwnershipTransactionResponse;
}

interface ExecuteMultiSigTransactionParams {
  safeAccountId: string;
  to: string;
  /**
   * The hbar value sent when creating the transaction. This value is needed to
   * compute the correct hash value when executing the transaction in the HederaGnosisSafe contract.
   **/
  msgValue: number;
  hexStringData: string;
  operation: number;
  nonce: number;
  signer: HashConnectSigner;
}

export async function sendExecuteMultiSigTransaction(params: ExecuteMultiSigTransactionParams) {
  const { safeAccountId, to, msgValue, hexStringData, operation, nonce, signer } = params;
  const safeContractId = ContractId.fromString(safeAccountId);
  const preciseValue = BigNumber(msgValue);
  const byteData = ethers.utils.arrayify(hexStringData);

  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(to)
    .addUint256(preciseValue)
    .addBytes(byteData)
    .addUint8(operation)
    .addUint256(nonce);

  const executeMultiSigTransaction = await new ContractExecuteTransaction()
    .setContractId(safeContractId)
    .setFunction(HederaGnosisSafeFunctions.ExecuteTransaction, contractFunctionParameters)
    .setGas(Gas)
    .freezeWithSigner(signer);

  const executeMultiSigTransactionResponse = await executeMultiSigTransaction.executeWithSigner(signer);
  checkTransactionResponseForError(executeMultiSigTransactionResponse, HederaGnosisSafeFunctions.ExecuteTransaction);
  return executeMultiSigTransactionResponse;
}
