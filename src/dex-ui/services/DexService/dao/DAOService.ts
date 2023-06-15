import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { AccountId, ContractId, ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";
import { DexService } from "@services";
import { Contracts, Gas } from "../../constants";
import { getEventArgumentsByName } from "../../utils";
import GovernanceDAOFactoryJSON from "../../abi/GovernanceDAOFactory.json";
import MultiSigDAOFactoryJSON from "../../abi/MultiSigDAOFactory.json";
import HederaGnosisSafeJSON from "../../abi/HederaGnosisSafe.json";
import MultiSigDAOJSON from "../../abi/MultiSigDAO.json";
import GovernorTokenDAOJSON from "../../abi/GovernorTokenDAO.json";
import {
  MultiSigDAODetails,
  MultiSigDAOCreatedEventArgs,
  DAOType,
  GovernanceDAODetails,
  NFTDAODetails,
  GovernanceDAOCreatedEventArgs,
  DAO,
  DAOEvents,
  NFTDAOCreatedEventArgs,
  HederaGnosisSafeFunctions,
  MultiSigProposeTransactionType,
} from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { checkTransactionResponseForError } from "@dex-ui/services/HederaService/utils";
import { convertToByte32 } from "@utils";

async function fetchMultiSigDAOs(eventTypes?: string[]): Promise<MultiSigDAODetails[]> {
  const logs = await DexService.fetchParsedEventLogs(
    Contracts.MultiSigDAOFactory.ProxyId,
    new ethers.utils.Interface(MultiSigDAOFactoryJSON.abi),
    eventTypes
  );
  return logs.map((log): MultiSigDAODetails => {
    const argsWithName = getEventArgumentsByName<MultiSigDAOCreatedEventArgs>(log.args, ["owners"]);
    const {
      daoAddress,
      admin,
      name,
      logoUrl,
      isPrivate,
      safeAddress,
      owners,
      threshold,
      title,
      description,
      webLinks,
    } = argsWithName;
    return {
      type: DAOType.MultiSig,
      accountId: AccountId.fromSolidityAddress(daoAddress).toString(),
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
      logoUrl,
      title,
      description,
      isPrivate,
      webLinks,
      safeId: AccountId.fromSolidityAddress(safeAddress).toString(),
      ownerIds: owners.map((owner) => AccountId.fromSolidityAddress(owner).toString()),
      threshold: threshold.toNumber(),
    };
  });
}

async function fetchGovernanceDAOs(eventTypes?: string[]): Promise<GovernanceDAODetails[]> {
  const logs = await DexService.fetchParsedEventLogs(
    Contracts.GovernanceDAOFactory.ProxyId,
    new ethers.utils.Interface(GovernanceDAOFactoryJSON.abi),
    eventTypes
  );
  return logs.map((log): GovernanceDAODetails => {
    const argsWithName = getEventArgumentsByName<GovernanceDAOCreatedEventArgs>(log.args);
    const {
      daoAddress,
      admin,
      name,
      logoUrl,
      isPrivate,
      tokenAddress,
      quorumThreshold,
      votingDelay,
      votingPeriod,
      title,
      linkToDiscussion,
      description,
      governanceAddress,
      tokenHolderAddress,
      webLinks,
    } = argsWithName;
    return {
      type: DAOType.GovernanceToken,
      accountId: AccountId.fromSolidityAddress(daoAddress).toString(),
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
      logoUrl,
      isPrivate,
      title,
      webLinks,
      description,
      linkToDiscussion,
      governanceAddress: AccountId.fromSolidityAddress(governanceAddress).toString(),
      tokenHolderAddress: AccountId.fromSolidityAddress(tokenHolderAddress).toString(),
      tokenId: AccountId.fromSolidityAddress(tokenAddress).toString(),
      quorumThreshold: quorumThreshold.toNumber(),
      votingDelay: votingDelay.toNumber(),
      votingPeriod: votingPeriod.toNumber(),
    };
  });
}

async function fetchNFTDAOs(eventTypes?: string[]): Promise<NFTDAODetails[]> {
  //TODO: Change the ABI to NFTDAOFactory, for now its not working for fetching the NFT logs using NFTDAOFactory ABI
  const logs = await DexService.fetchParsedEventLogs(
    Contracts.NFTDAOFactory.ProxyId,
    new ethers.utils.Interface(GovernanceDAOFactoryJSON.abi),
    eventTypes
  );
  return logs.map((log): NFTDAODetails => {
    const argsWithName = getEventArgumentsByName<NFTDAOCreatedEventArgs>(log.args);
    const {
      daoAddress,
      admin,
      name,
      logoUrl,
      isPrivate,
      tokenAddress,
      quorumThreshold,
      votingDelay,
      votingPeriod,
      title,
      description,
      linkToDiscussion,
      governanceAddress,
      tokenHolderAddress,
      webLinks,
    } = argsWithName;
    return {
      type: DAOType.NFT,
      accountId: AccountId.fromSolidityAddress(daoAddress).toString(),
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
      title,
      description,
      webLinks,
      linkToDiscussion,
      governanceAddress: AccountId.fromSolidityAddress(governanceAddress).toString(),
      tokenHolderAddress: AccountId.fromSolidityAddress(tokenHolderAddress).toString(),
      logoUrl,
      isPrivate,
      tokenId: AccountId.fromSolidityAddress(tokenAddress).toString(),
      quorumThreshold: quorumThreshold.toNumber(),
      votingDelay: votingDelay.toNumber(),
      votingPeriod: votingPeriod.toNumber(),
    };
  });
}

export async function fetchAllDAOs(): Promise<DAO[]> {
  const daos = await Promise.all([
    fetchMultiSigDAOs([DAOEvents.DAOCreated]),
    fetchGovernanceDAOs([DAOEvents.DAOCreated]),
    fetchNFTDAOs([DAOEvents.DAOCreated]),
  ]);
  return daos.flat();
}

export async function fetchMultiSigDAOLogs(daoAccountId: string): Promise<ethers.utils.LogDescription[]> {
  const contractInterface = new ethers.utils.Interface(MultiSigDAOJSON.abi);
  const abiCoder = ethers.utils.defaultAbiCoder;
  const parsedEvents = await DexService.fetchParsedEventLogs(daoAccountId, contractInterface);

  const parsedEventsWithData = parsedEvents.map((event) => {
    if (event.name === DAOEvents.TransactionCreated) {
      const transactionType: MultiSigProposeTransactionType = event.args.info.transactionType.toNumber();
      let parsedData;
      if (transactionType === MultiSigProposeTransactionType.AddMember) {
        parsedData = abiCoder.decode(
          ["address owner", "uint256 _threshold"],
          ethers.utils.hexDataSlice(event.args.info.data, 4)
        );
      } else if (transactionType === MultiSigProposeTransactionType.DeleteMember) {
        parsedData = abiCoder.decode(
          ["address prevOwner", "address owner", "uint256 _threshold"],
          ethers.utils.hexDataSlice(event.args.info.data, 4)
        );
      } else if (transactionType === MultiSigProposeTransactionType.ReplaceMember) {
        parsedData = abiCoder.decode(
          ["address prevOwner", "address oldOwner", "address newOwner"],
          ethers.utils.hexDataSlice(event.args.info.data, 4)
        );
      } else if (transactionType === MultiSigProposeTransactionType.ChangeThreshold) {
        parsedData = abiCoder.decode(["uint256 _threshold"], ethers.utils.hexDataSlice(event.args.info.data, 4));
      } else if (transactionType === MultiSigProposeTransactionType.TokenTransfer) {
        parsedData = abiCoder.decode(
          ["address token", "address receiver", "uint256 amount"],
          ethers.utils.hexDataSlice(event.args.info.data, 4)
        );
      }
      const eventClone: ethers.utils.LogDescription = structuredClone(event);
      eventClone.args.info.data = parsedData;
      eventClone.args.info.hexStringData = event.args.info.data;
      return eventClone;
    }
    return event;
  });
  return parsedEventsWithData;
}

export async function fetchGovernanceDAOLogs(daoAccountId: string): Promise<ethers.utils.LogDescription[]> {
  const contractInterface = new ethers.utils.Interface(GovernorTokenDAOJSON.abi);
  const abiCoder = ethers.utils.defaultAbiCoder;
  const parsedEvents = await DexService.fetchParsedEventLogs(daoAccountId, contractInterface);

  const parsedEventsWithData = parsedEvents.map((event) => {
    if (event.name === DAOEvents.TransactionCreated) {
      const parsedData = abiCoder.decode(
        ["address token", "address receiver", "uint256 amount"],
        ethers.utils.hexDataSlice(event.args.info.data, 4)
      );
      const eventClone: ethers.utils.LogDescription = structuredClone(event);
      eventClone.args.info.data = parsedData;
      eventClone.args.info.hexStringData = event.args.info.data;
      return eventClone;
    }
    return event;
  });
  return parsedEventsWithData;
}

export async function fetchNFTDAOLogs(daoAccountId: string): Promise<ethers.utils.LogDescription[]> {
  const contractInterface = new ethers.utils.Interface(GovernorTokenDAOJSON.abi);
  const abiCoder = ethers.utils.defaultAbiCoder;
  const parsedEvents = await DexService.fetchParsedEventLogs(daoAccountId, contractInterface);

  const parsedEventsWithData = parsedEvents.map((event) => {
    if (event.name === DAOEvents.TransactionCreated) {
      const parsedData = abiCoder.decode(
        ["address token", "address receiver", "uint256 amount"],
        ethers.utils.hexDataSlice(event.args.info.data, 4)
      );
      const eventClone: ethers.utils.LogDescription = structuredClone(event);
      eventClone.args.info.data = parsedData;
      eventClone.args.info.hexStringData = event.args.info.data;
      return eventClone;
    }
    return event;
  });
  return parsedEventsWithData;
}

export async function fetchHederaGnosisSafeLogs(safeAccountId: string) {
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  return DexService.fetchParsedEventLogs(safeAccountId, contractInterface);
}

export interface ProposeAddOwnerWithThresholdParams {
  safeAccountId: string;
  newMemberAddress: string;
  multiSigDAOContractId: string;
  threshold: number;
  title: string;
  description: string;
  signer: HashConnectSigner;
}

export async function proposeAddOwnerWithThreshold(params: ProposeAddOwnerWithThresholdParams) {
  const { newMemberAddress, threshold, safeAccountId, multiSigDAOContractId, signer, title, description } = params;
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const newOwnerData = contractInterface.encodeFunctionData("addOwnerWithThreshold", [
    AccountId.fromString(newMemberAddress).toSolidityAddress(),
    threshold,
  ]);

  return DexService.sendProposeTransaction({
    safeAccountId,
    data: newOwnerData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.AddMember,
    title,
    description,
    signer,
  });
}

export interface ProposeRemoveOwnerWithThresholdParams {
  safeAccountId: string;
  memberAddress: string;
  title: string;
  description: string;
  multiSigDAOContractId: string;
  threshold: number;
  signer: HashConnectSigner;
}

export async function proposeRemoveOwnerWithThreshold(params: ProposeRemoveOwnerWithThresholdParams) {
  const { memberAddress, threshold, safeAccountId, multiSigDAOContractId, signer, title, description } = params;
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const removeOwnerData = contractInterface.encodeFunctionData("removeOwner", [
    AccountId.fromString(memberAddress).toSolidityAddress(),
    AccountId.fromString(memberAddress).toSolidityAddress(),
    threshold,
  ]);

  return DexService.sendProposeTransaction({
    safeAccountId,
    data: removeOwnerData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.DeleteMember,
    title,
    description,
    signer,
  });
}

export interface ProposeSwapOwnerWithThresholdParams {
  safeAccountId: string;
  oldMemberAddress: string;
  title: string;
  description: string;
  newMemberAddress: string;
  multiSigDAOContractId: string;
  signer: HashConnectSigner;
}

export async function proposeSwapOwnerWithThreshold(params: ProposeSwapOwnerWithThresholdParams) {
  const { newMemberAddress, safeAccountId, multiSigDAOContractId, oldMemberAddress, signer, title, description } =
    params;
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const removeOwnerData = contractInterface.encodeFunctionData("swapOwner", [
    AccountId.fromString(oldMemberAddress).toSolidityAddress(),
    AccountId.fromString(oldMemberAddress).toSolidityAddress(),
    AccountId.fromString(newMemberAddress).toSolidityAddress(),
  ]);

  return DexService.sendProposeTransaction({
    safeAccountId,
    data: removeOwnerData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.ReplaceMember,
    title,
    description,
    signer,
  });
}

export interface ProposeChangeThresholdParams {
  safeAccountId: string;
  title: string;
  description: string;
  threshold: number;
  multiSigDAOContractId: string;
  signer: HashConnectSigner;
}

export async function proposeChangeThreshold(params: ProposeChangeThresholdParams) {
  const { safeAccountId, multiSigDAOContractId, threshold, signer, title, description } = params;
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const changeThresholdData = contractInterface.encodeFunctionData("changeThreshold", [threshold]);

  return DexService.sendProposeTransaction({
    safeAccountId,
    data: changeThresholdData,
    multiSigDAOContractId,
    transactionType: MultiSigProposeTransactionType.ChangeThreshold,
    title,
    description,
    signer,
  });
}

export async function sendApproveMultiSigTransaction(
  safeId: string,
  transactionHash: string,
  signer: HashConnectSigner
) {
  const safeContractId = ContractId.fromString(safeId);
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

interface ExecuteMultiSigTransactionParams {
  safeId: string;
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
  const { safeId, msgValue, hexStringData, operation, nonce, signer } = params;
  const safeContractId = ContractId.fromString(safeId);
  const toAddress = AccountId.fromString(safeId).toSolidityAddress();
  const preciseValue = BigNumber(msgValue);
  const byteData = ethers.utils.arrayify(hexStringData);

  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(toAddress)
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
