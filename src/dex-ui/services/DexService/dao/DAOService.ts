import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { AccountId, ContractId, ContractExecuteTransaction, ContractFunctionParameters } from "@hashgraph/sdk";
import {
  checkTransactionResponseForError,
  convertEthersBigNumberToBigNumberJS,
  DexService,
  getFulfilledResultsData,
  MirrorNodeDecodedProposalEvent,
  solidityAddressToTokenIdString,
} from "@services";
import { Contracts, Gas } from "../../constants";
import { getEventArgumentsByName } from "../../utils";
import FTDAOFactoryJSON from "../../abi/FTDAOFactory.json";
import MultiSigDAOFactoryJSON from "../../abi/MultiSigDAOFactory.json";
import HederaGnosisSafeJSON from "../../abi/HederaGnosisSafe.json";
import MultiSigDAOJSON from "../../abi/MultiSigDAO.json";
import FTDAOJSON from "../../abi/FTDAO.json";
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
  DAOProposalGovernors,
  MultiSigDaoSettingsDetails,
  MultiSigDAODetailsInfoEventArgs,
} from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { convertToByte32 } from "@utils";
import { ProposalType } from "@hooks";
import { ProposalData } from "../governance/type";
import { isNil } from "ramda";
import { LogDescription } from "ethers/lib/utils";
import GovernorCountingSimpleInternalJSON from "../../abi/GovernorCountingSimpleInternal.json";

export function getOwners(proposalLogs: LogDescription[]): string[] {
  const owners = new Set<string>();
  proposalLogs
    .slice()
    .reverse()
    .forEach((log: LogDescription) => {
      if (log?.name === DAOEvents.SafeSetup) {
        const {
          args: { owners: daoOwners },
        } = log;
        daoOwners.forEach((owner: string) => owners.add(owner));
      }
      if (log?.name === DAOEvents.AddedOwner) {
        const { args } = log;
        owners.add(args.owner);
      }
      if (log?.name === DAOEvents.RemovedOwner) {
        const { args } = log;
        owners.delete(args.owner);
      }
    });
  return Array.from(owners).reverse();
}

export function getThreshold(proposalLogs: LogDescription[], baseThreshold: ethers.BigNumber): number {
  let updatedThreshold = baseThreshold;
  proposalLogs
    .slice()
    .reverse()
    .forEach((log: LogDescription) => {
      if (log?.name === DAOEvents.SafeSetup) {
        const {
          args: { threshold },
        } = log;
        updatedThreshold = threshold;
      }
      if (log?.name === DAOEvents.ChangedThreshold) {
        const {
          args: { threshold },
        } = log;
        updatedThreshold = threshold;
      }
    });
  return updatedThreshold.toNumber();
}

async function fetchMultiSigDAOs(eventTypes?: string[]): Promise<MultiSigDAODetails[]> {
  const logs = await DexService.fetchParsedEventLogs(
    Contracts.MultiSigDAOFactory.ProxyId,
    new ethers.utils.Interface(MultiSigDAOFactoryJSON.abi),
    eventTypes
  );

  const multiSigEventResults = logs.map(async (log): Promise<MultiSigDAODetails> => {
    const argsWithName = getEventArgumentsByName<MultiSigDAOCreatedEventArgs>(log.args, ["owners", "webLinks"]);
    argsWithName.daoAddress = (await DexService.fetchContractId(argsWithName.daoAddress)).toSolidityAddress();
    argsWithName.safeAddress = (await DexService.fetchContractId(argsWithName.safeAddress)).toSolidityAddress();
    const { daoAddress, safeAddress, inputs } = argsWithName;
    const { admin, isPrivate, threshold: _threshold, title } = inputs;
    const safeLogs = await fetchHederaGnosisSafeLogs(safeAddress);
    const owners = getOwners(safeLogs);
    const threshold = getThreshold(safeLogs, _threshold);

    /** START - TODO: Need to apply a proper fix */
    let accountId;
    try {
      accountId = AccountId.fromSolidityAddress(daoAddress).toString();
    } catch (e) {
      console.error(e, daoAddress);
      return {
        type: DAOType.MultiSig,
        accountId: "Error",
        adminId: "Error",
        name: "Error",
        logoUrl: "Error",
        title: "Error",
        description: "Error",
        isPrivate: false,
        webLinks: ["Error"],
        safeId: "Error",
        ownerIds: ["Error"],
        threshold,
      };
    }
    /** END - TODO: Need to apply a proper fix */

    const { name, description, logoUrl, webLinks } = await fetchMultiSigDAOSettingsPageDetails(accountId, [
      DAOEvents.DAOInfoUpdated,
    ]);

    return {
      type: DAOType.MultiSig,
      accountId,
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
      logoUrl,
      title,
      description,
      isPrivate,
      webLinks,
      safeId: AccountId.fromSolidityAddress(safeAddress).toString(),
      ownerIds: owners.map((owner) => AccountId.fromSolidityAddress(owner).toString()),
      threshold,
    };
  });

  return Promise.all(multiSigEventResults);
}

async function fetchMultiSigDAOSettingsPageDetails(
  accountId: string,
  eventTypes?: string[]
): Promise<MultiSigDaoSettingsDetails> {
  const log = await DexService.fetchParsedEventLogs(
    accountId,
    new ethers.utils.Interface(MultiSigDAOJSON.abi),
    eventTypes
  );
  const argsWithName = getEventArgumentsByName<MultiSigDAODetailsInfoEventArgs>(log[0].args.daoInfo, ["webLinks"]);
  const { name, logoUrl, description, webLinks } = argsWithName;

  return {
    name,
    logoUrl,
    description,
    webLinks,
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

    argsWithName.daoAddress = (await DexService.fetchContractId(argsWithName.daoAddress)).toSolidityAddress();
    argsWithName.governors.contractUpgradeLogic = (
      await DexService.fetchContractId(argsWithName.governors.contractUpgradeLogic)
    ).toSolidityAddress();
    argsWithName.governors.textLogic = (
      await DexService.fetchContractId(argsWithName.governors.textLogic)
    ).toSolidityAddress();
    argsWithName.governors.tokenTransferLogic = (
      await DexService.fetchContractId(argsWithName.governors.tokenTransferLogic)
    ).toSolidityAddress();
    argsWithName.governors.createTokenLogic = (
      await DexService.fetchContractId(argsWithName.governors.createTokenLogic)
    ).toSolidityAddress();

    const { daoAddress, governors, tokenHolderAddress, inputs } = argsWithName;
    const {
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
      webLinks,
    } = inputs;

    /** START - TODO: Need to apply a proper fix */
    let accountId;
    let tokenHolderId;
    let tokenId;
    try {
      accountId = AccountId.fromSolidityAddress(daoAddress).toString();
    } catch (e) {
      console.error(e, daoAddress);
      return {
        type: DAOType.GovernanceToken,
        accountId: "Error",
        adminId: "Error",
        name: "Error",
        logoUrl: "Error",
        isPrivate: false,
        title: "Error",
        webLinks: ["Error"],
        description: "Error",
        linkToDiscussion: "Error",
        governors,
        tokenHolderAddress: "Error",
        tokenId: "Error",
        quorumThreshold: 1,
        votingDelay: 1,
        votingPeriod: 1,
      };
    }
    /** END - TODO: Need to apply a proper fix */

    try {
      tokenHolderId = AccountId.fromSolidityAddress(tokenHolderAddress).toString();
    } catch (error) {
      tokenHolderId = (await DexService.fetchContractId(tokenHolderAddress)).toString();
    }

    try {
      tokenId = AccountId.fromSolidityAddress(tokenAddress).toString();
    } catch (error) {
      tokenId = (await DexService.fetchContractId(tokenAddress)).toString();
    }

    return {
      type: DAOType.GovernanceToken,
      accountId,
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
      logoUrl,
      isPrivate,
      title,
      webLinks,
      description,
      linkToDiscussion,
      governors,
      tokenHolderAddress: tokenHolderId,
      tokenId: tokenId,
      quorumThreshold: quorumThreshold.toNumber(),
      votingDelay: votingDelay.toNumber(),
      votingPeriod: votingPeriod.toNumber(),
    };
  });

  return await Promise.all(allPromises);
}

async function fetchNFTDAOs(eventTypes?: string[]): Promise<NFTDAODetails[]> {
  //TODO: Change the ABI to NFTDAOFactory, for now its not working for fetching the NFT logs using NFTDAOFactory ABI
  const logs = await DexService.fetchParsedEventLogs(
    Contracts.NFTDAOFactory.ProxyId,
    new ethers.utils.Interface(FTDAOFactoryJSON.abi),
    eventTypes
  );
  const allPromises = logs.map(async (log): Promise<NFTDAODetails> => {
    const argsWithName = getEventArgumentsByName<NFTDAOCreatedEventArgs>(log.args, ["webLinks"]);

    argsWithName.daoAddress = (await DexService.fetchContractId(argsWithName.daoAddress)).toSolidityAddress();
    argsWithName.governors.contractUpgradeLogic = (
      await DexService.fetchContractId(argsWithName.governors.contractUpgradeLogic)
    ).toSolidityAddress();
    argsWithName.governors.textLogic = (
      await DexService.fetchContractId(argsWithName.governors.textLogic)
    ).toSolidityAddress();
    argsWithName.governors.tokenTransferLogic = (
      await DexService.fetchContractId(argsWithName.governors.tokenTransferLogic)
    ).toSolidityAddress();
    argsWithName.governors.createTokenLogic = (
      await DexService.fetchContractId(argsWithName.governors.createTokenLogic)
    ).toSolidityAddress();

    const { daoAddress, governors, tokenHolderAddress, inputs } = argsWithName;
    const {
      admin,
      name,
      logoUrl,
      isPrivate,
      title,
      description,
      linkToDiscussion,
      tokenAddress,
      webLinks,
      quorumThreshold,
      votingDelay,
      votingPeriod,
    } = inputs;
    /** START - TODO: Need to apply a proper fix */
    let accountId;
    try {
      accountId = AccountId.fromSolidityAddress(daoAddress).toString();
    } catch (e) {
      console.error(e, daoAddress);
      return {
        type: DAOType.NFT,
        accountId: "Error",
        adminId: "Error",
        name: "Error",
        title: "Error",
        description: "Error",
        webLinks: ["Error"],
        linkToDiscussion: "Error",
        governors: {
          contractUpgradeLogic: "Error",
          createTokenLogic: "Error",
          textLogic: "Error",
          tokenTransferLogic: "Error",
        },
        tokenHolderAddress: "Error",
        logoUrl: "Error",
        isPrivate: false,
        tokenId: "Error",
        quorumThreshold: 1,
        votingDelay: 1,
        votingPeriod: 1,
      };
    }
    /** END - TODO: Need to apply a proper fix */
    return {
      type: DAOType.NFT,
      accountId,
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
      title,
      description,
      webLinks,
      linkToDiscussion,
      governors,
      tokenHolderAddress: AccountId.fromSolidityAddress(tokenHolderAddress).toString(),
      logoUrl,
      isPrivate,
      tokenId: AccountId.fromSolidityAddress(tokenAddress).toString(),
      quorumThreshold: quorumThreshold.toNumber(),
      votingDelay: votingDelay.toNumber(),
      votingPeriod: votingPeriod.toNumber(),
    };
  });

  return Promise.all(allPromises);
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
      } else if (transactionType === MultiSigProposeTransactionType.TokenAssociation) {
        parsedData = abiCoder.decode(
          ["address", "address tokenAddress"],
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

export async function fetchGovernanceDAOLogs(governors: DAOProposalGovernors): Promise<ProposalData[]> {
  const contractInterface = new ethers.utils.Interface(GovernorCountingSimpleInternalJSON.abi);
  const DefaultTokenTransferDetails = {
    transferFromAccount: undefined,
    transferToAccount: undefined,
    tokenToTransfer: undefined,
    transferTokenAmount: undefined,
  };

  const getTokenTransferDetailsFromHexData = (data: string | undefined) => {
    if (isNil(data)) return { ...DefaultTokenTransferDetails };
    const abiCoder = ethers.utils.defaultAbiCoder;
    const parsedData = abiCoder.decode(
      [
        "address transferFromAccount",
        "address transferToAccount",
        "address tokenToTransfer",
        "uint256 transferTokenAmount",
      ],
      data
    );
    return {
      transferFromAccount: solidityAddressToTokenIdString(parsedData.transferFromAccount),
      transferToAccount: solidityAddressToTokenIdString(parsedData.transferToAccount),
      tokenToTransfer: solidityAddressToTokenIdString(parsedData.tokenToTransfer),
      transferTokenAmount: convertEthersBigNumberToBigNumberJS(parsedData.transferTokenAmount).toNumber(),
    };
  };
  const fetchDAOProposalEvents = async (): Promise<MirrorNodeDecodedProposalEvent[]> => {
    const proposalEventsResults = await Promise.allSettled([
      DexService.fetchContractProposalEvents(ProposalType.TokenTransfer, governors.tokenTransferLogic, false),
      DexService.fetchContractProposalEvents(ProposalType.TextProposal, governors.textLogic, false),
      DexService.fetchContractProposalEvents(ProposalType.UpgradeContract, governors.contractUpgradeLogic, false),
    ]);
    return getFulfilledResultsData<MirrorNodeDecodedProposalEvent>(proposalEventsResults);
  };

  const fetchDAOProposalData = async (proposalEvents: MirrorNodeDecodedProposalEvent[]): Promise<ProposalData[]> => {
    const proposalEventsWithDetailsResults = await Promise.allSettled(
      proposalEvents.map(async (proposalEvent: MirrorNodeDecodedProposalEvent) => {
        const tokenTransferDetails = getTokenTransferDetailsFromHexData(proposalEvent.data);
        let contractId = proposalEvent.contractId;
        if (contractId.includes("0.0")) {
          contractId = ContractId.fromString(contractId).toSolidityAddress();
        }
        const response = await DexService.callContract({
          block: "latest",
          data: contractInterface.encodeFunctionData("state", [proposalEvent.proposalId]),
          estimate: false,
          from: AccountId.fromString("0.0.4602608").toSolidityAddress(), //TODO: change account id.
          gas: 9000000,
          gasPrice: 100000000,
          to: contractId.toString(),
          value: 0,
        });
        const dataParsed = contractInterface.decodeFunctionResult("state", ethers.utils.arrayify(response.data.result));
        /**
         * proposalDetails contain the latest proposal state. Therefore, the common fields derived from
         * proposalDetails should override the same field found in the proposalEvent.
         */
        return { ...proposalEvent, state: dataParsed.at(0), ...tokenTransferDetails };
      })
    );
    const proposalEventsWithDetails = proposalEventsWithDetailsResults.map((event: PromiseSettledResult<any>) => {
      return event.status === "fulfilled" ? event.value : undefined;
    });
    return proposalEventsWithDetails;
  };

  const proposalEvents = await fetchDAOProposalEvents();
  const proposalDetails = await fetchDAOProposalData(proposalEvents);
  return proposalDetails;
}

export async function fetchNFTDAOLogs(daoAccountId: string): Promise<ethers.utils.LogDescription[]> {
  const contractInterface = new ethers.utils.Interface(FTDAOJSON.abi);
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
    safeAccountId,
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
    safeAccountId,
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
  const safeContractId = await DexService.fetchContractId(safeId);
  const preciseValue = BigNumber(msgValue);
  const byteData = ethers.utils.arrayify(hexStringData);

  const contractFunctionParameters = new ContractFunctionParameters()
    .addAddress(safeId)
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
