import { ethers } from "ethers";
import { BigNumber } from "bignumber.js";
import { AccountId, ContractId, ContractExecuteTransaction, ContractFunctionParameters, TokenId } from "@hashgraph/sdk";
import {
  abiSignatures,
  checkTransactionResponseForError,
  convertEthersBigNumberToBigNumberJS,
  decodeLog,
  DexService,
  getFulfilledResultsData,
  MirrorNodeDecodedProposalEvent,
} from "@dex/services";
import { Contracts, Gas, HBARTokenId, MINIMUM_DEPOSIT_AMOUNT } from "@dex/services";
import { getEventArgumentsByName } from "../../dex/services/utils";
import FTDAOFactoryJSON from "../../dex/services/abi/FTDAOFactory.json";
import MultiSigDAOFactoryJSON from "../../dex/services/abi/MultiSigDAOFactory.json";
import HederaGnosisSafeJSON from "../../dex/services/abi/HederaGnosisSafe.json";
import MultiSigDAOJSON from "../../dex/services/abi/MultiSigDAO.json";
import BaseDAOJSON from "../../dex/services/abi/BaseDAO.json";

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
  DAOSettingsDetails,
  DAODetailsInfoEventArgs,
  GovernanceProposalOperationType,
  UpgradeContractDetails,
  ProposalDataDetails,
} from "./types";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { convertNumberToPercentage, convertToByte32 } from "@dex/utils";
import { ProposalType } from "@dao/hooks";
import { ProposalData } from "../../dex/services/DexService/governance/type";
import { isNil, isNotNil } from "ramda";
import GovernorCountingSimpleInternalJSON from "../../dex/services/abi/GovernorCountingSimpleInternal.json";
import { ContractProposalState } from "@dex/store";
import { solidityAddressToAccountIdString, solidityAddressToTokenIdString } from "@shared/utils";

export async function getOwners(safeAddress: string): Promise<string[]> {
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const response = await DexService.callContract({
    data: contractInterface.encodeFunctionData("getOwners"),
    from: safeAddress,
    to: safeAddress,
  });
  const ownersList = contractInterface.decodeFunctionResult("getOwners", ethers.utils.arrayify(response.data.result));
  return ownersList[0];
}

export async function getThreshold(safeAddress: string): Promise<number> {
  const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
  const response = await DexService.callContract({
    data: contractInterface.encodeFunctionData("getThreshold"),
    from: safeAddress,
    to: safeAddress,
  });
  const threshold = contractInterface.decodeFunctionResult("getThreshold", ethers.utils.arrayify(response.data.result));
  return threshold[0].toNumber();
}

async function fetchMultiSigDAOs(eventTypes?: string[]): Promise<MultiSigDAODetails[]> {
  const logs = await DexService.fetchParsedEventLogs(
    Contracts.MultiSigDAOFactory.ProxyId,
    new ethers.utils.Interface(MultiSigDAOFactoryJSON.abi),
    eventTypes
  );

  const multiSigEventResults = logs.map(async (log): Promise<MultiSigDAODetails> => {
    const argsWithName = getEventArgumentsByName<MultiSigDAOCreatedEventArgs>(log.args, ["owners", "webLinks"]);
    const { inputs: initialDAODetails, safeAddress: safeEVMAddress, daoAddress } = argsWithName;
    const owners = await getOwners(safeEVMAddress);
    const threshold = await getThreshold(safeEVMAddress);
    const { admin, isPrivate, name, description, logoUrl, webLinks } = initialDAODetails;
    const updatedDAODetails = await fetchDAOSettingsPageDetails(daoAddress, [DAOEvents.DAOInfoUpdated]);
    return {
      type: DAOType.MultiSig,
      accountId: daoAddress,
      adminId: solidityAddressToAccountIdString(admin),
      name: updatedDAODetails?.name ?? name,
      logoUrl: updatedDAODetails?.logoUrl ?? logoUrl,
      title: updatedDAODetails?.name ?? name,
      description: updatedDAODetails?.description ?? description,
      isPrivate,
      webLinks: updatedDAODetails?.webLinks ?? webLinks,
      safeEVMAddress,
      ownerIds: owners.map((owner) => solidityAddressToAccountIdString(owner)),
      threshold,
    };
  });

  return Promise.all(multiSigEventResults);
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

    const {
      daoAddress,
      governors: { contractUpgradeLogic, textLogic, tokenTransferLogic, createTokenLogic },
      tokenHolderAddress,
      inputs: initialDAODetails,
    } = argsWithName;
    const daoSolidityAddress = (await DexService.fetchContractId(daoAddress)).toSolidityAddress();
    const upgradeLogicSolidityAddress = (await DexService.fetchContractId(contractUpgradeLogic)).toSolidityAddress();
    const tokenHolderSolidityAddress = (await DexService.fetchContractId(tokenHolderAddress)).toSolidityAddress();
    const textLogicSolidityAddress = (await DexService.fetchContractId(textLogic)).toSolidityAddress();
    const transferLogicSolidityAddress = (await DexService.fetchContractId(tokenTransferLogic)).toSolidityAddress();
    const tokenLoginSolidityAddress = (await DexService.fetchContractId(createTokenLogic)).toSolidityAddress();

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

    const updatedDAODetails = await fetchDAOSettingsPageDetails(daoSolidityAddress, [DAOEvents.DAOInfoUpdated]);

    /** START - TODO: Need to apply a proper fix */
    let accountId;
    let tokenId;
    try {
      accountId = solidityAddressToAccountIdString(daoSolidityAddress);
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
        infoUrl: "Error",
        governors: {
          contractUpgradeLogic: "Error",
          createTokenLogic: "Error",
          textLogic: "Error",
          tokenTransferLogic: "Error",
        },
        tokenHolderAddress: "Error",
        tokenId: "Error",
        quorumThreshold: 1,
        votingDelay: 1,
        votingPeriod: 1,
      };
    }
    /** END - TODO: Need to apply a proper fix */
    try {
      tokenId = solidityAddressToTokenIdString(tokenAddress);
    } catch (error) {
      tokenId = (await DexService.fetchContractId(tokenAddress)).toString();
    }

    return {
      type: DAOType.GovernanceToken,
      accountId,
      adminId: solidityAddressToAccountIdString(admin),
      name: updatedDAODetails?.name ?? name,
      logoUrl: updatedDAODetails?.logoUrl ?? logoUrl,
      infoUrl,
      isPrivate,
      title: updatedDAODetails?.name ?? name,
      webLinks: updatedDAODetails?.webLinks ?? webLinks,
      description: updatedDAODetails?.description ?? description,
      governors: {
        contractUpgradeLogic: upgradeLogicSolidityAddress,
        createTokenLogic: tokenLoginSolidityAddress,
        textLogic: textLogicSolidityAddress,
        tokenTransferLogic: transferLogicSolidityAddress,
      },
      tokenHolderAddress: solidityAddressToAccountIdString(tokenHolderSolidityAddress),
      tokenId: tokenId,
      quorumThreshold: convertNumberToPercentage(quorumThreshold.toNumber()),
      votingDelay: votingDelay.toNumber(),
      votingPeriod: votingPeriod.toNumber(),
      minimumProposalDeposit: MINIMUM_DEPOSIT_AMOUNT,
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
    const {
      daoAddress,
      governors: { contractUpgradeLogic, textLogic, tokenTransferLogic, createTokenLogic },
      tokenHolderAddress,
      inputs: initialDAODetails,
    } = argsWithName;
    const daoSolidityAddress = (await DexService.fetchContractId(daoAddress)).toSolidityAddress();
    const upgradeLogicSolidityAddress = (await DexService.fetchContractId(contractUpgradeLogic)).toSolidityAddress();
    const tokenHolderSolidityAddress = (await DexService.fetchContractId(tokenHolderAddress)).toSolidityAddress();
    const textLogicSolidityAddress = (await DexService.fetchContractId(textLogic)).toSolidityAddress();
    const transferLogicSolidityAddress = (await DexService.fetchContractId(tokenTransferLogic)).toSolidityAddress();
    const tokenLoginSolidityAddress = (await DexService.fetchContractId(createTokenLogic)).toSolidityAddress();
    const {
      admin,
      isPrivate,
      name,
      description,
      webLinks,
      logoUrl,
      infoUrl,
      tokenAddress,
      quorumThreshold,
      votingDelay,
      votingPeriod,
    } = initialDAODetails;
    const updatedDAODetails = await fetchDAOSettingsPageDetails(daoSolidityAddress, [DAOEvents.DAOInfoUpdated]);

    /** START - TODO: Need to apply a proper fix */
    let accountId;
    let tokenId;
    try {
      accountId = solidityAddressToAccountIdString(daoSolidityAddress);
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
        infoUrl: "Error",
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
    try {
      tokenId = solidityAddressToTokenIdString(tokenAddress).toString();
    } catch (error) {
      tokenId = (await DexService.fetchContractId(tokenAddress)).toString();
    }
    /** END - TODO: Need to apply a proper fix */
    return {
      type: DAOType.NFT,
      accountId,
      adminId: solidityAddressToAccountIdString(admin),
      name: updatedDAODetails?.name ?? name,
      title: updatedDAODetails?.name ?? name,
      description: updatedDAODetails?.description ?? description,
      webLinks: updatedDAODetails?.webLinks ?? webLinks,
      infoUrl,
      governors: {
        contractUpgradeLogic: upgradeLogicSolidityAddress,
        createTokenLogic: tokenLoginSolidityAddress,
        textLogic: textLogicSolidityAddress,
        tokenTransferLogic: transferLogicSolidityAddress,
      },
      tokenHolderAddress: solidityAddressToAccountIdString(tokenHolderSolidityAddress),
      logoUrl: updatedDAODetails?.logoUrl ?? logoUrl,
      isPrivate,
      tokenId,
      quorumThreshold: convertNumberToPercentage(quorumThreshold.toNumber()),
      votingDelay: votingDelay.toNumber(),
      votingPeriod: votingPeriod.toNumber(),
      minimumProposalDeposit: MINIMUM_DEPOSIT_AMOUNT,
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
      switch (transactionType) {
        case MultiSigProposeTransactionType.AddMember: {
          parsedData = abiCoder.decode(
            ["address owner", "uint256 _threshold"],
            ethers.utils.hexDataSlice(event.args.info.data, 4)
          );
          break;
        }
        case MultiSigProposeTransactionType.DeleteMember: {
          parsedData = abiCoder.decode(
            ["address prevOwner", "address owner", "uint256 _threshold"],
            ethers.utils.hexDataSlice(event.args.info.data, 4)
          );
          break;
        }
        case MultiSigProposeTransactionType.ReplaceMember: {
          parsedData = abiCoder.decode(
            ["address prevOwner", "address oldOwner", "address newOwner"],
            ethers.utils.hexDataSlice(event.args.info.data, 4)
          );
          break;
        }
        case MultiSigProposeTransactionType.ChangeThreshold: {
          parsedData = abiCoder.decode(["uint256 _threshold"], ethers.utils.hexDataSlice(event.args.info.data, 4));
          break;
        }
        case MultiSigProposeTransactionType.TokenTransfer: {
          parsedData = abiCoder.decode(
            ["address", "address token", "address receiver", "uint256 amount"],
            ethers.utils.hexDataSlice(event.args.info.data, 4)
          );
          if (parsedData.token === ethers.constants.AddressZero) {
            parsedData = {
              ...parsedData,
              token: TokenId.fromString(HBARTokenId).toSolidityAddress(),
            };
          }
          break;
        }
        case MultiSigProposeTransactionType.TokenAssociation: {
          parsedData = abiCoder.decode(
            ["address", "address tokenAddress"],
            ethers.utils.hexDataSlice(event.args.info.data, 4)
          );
          break;
        }
        case MultiSigProposeTransactionType.HBARTokenTransfer: {
          parsedData = {
            amount: event.args.info.value,
            receiver: event.args.info.to,
            token: TokenId.fromString(HBARTokenId).toSolidityAddress(),
          };
          break;
        }
        case MultiSigProposeTransactionType.TypeSetText: {
          parsedData = abiCoder.decode(
            ["address account", "string title"],
            ethers.utils.hexDataSlice(event.args.info.data, 4)
          );
          break;
        }
        case MultiSigProposeTransactionType.UpgradeProxy: {
          parsedData = abiCoder.decode(
            ["address proxy", "address proxyLogic", "address proxyAdmin"],
            ethers.utils.hexDataSlice(event.args.info.data, 4)
          );
        }
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

function getProposalData(type: string, data: string | undefined): ProposalDataDetails {
  const getUpgradeContractProposalData = (data: string | undefined) => {
    if (isNil(data)) return;
    const abiCoder = ethers.utils.defaultAbiCoder;
    const parsedData = abiCoder.decode(["address proxy", "address proxyLogic", "address proxyAdmin"], data);
    return {
      type: ProposalType.UpgradeContract,
      proxy: parsedData.proxy,
      proxyAdmin: parsedData.proxyAdmin,
      proxyLogic: parsedData.proxyLogic,
    };
  };

  const getTokenTransferProposalDataFromHexData = (data: string | undefined) => {
    if (isNil(data)) return;
    const abiCoder = ethers.utils.defaultAbiCoder;
    const operationTypeData = ethers.utils.defaultAbiCoder.decode(["uint256 operationType"], data);
    const operationType = convertEthersBigNumberToBigNumberJS(operationTypeData.operationType).toNumber();
    switch (operationType) {
      case GovernanceProposalOperationType.TokenTransfer: {
        const parsedData = abiCoder.decode(
          [
            "uint256 operationType",
            "address transferToAccount",
            "address tokenToTransfer",
            "uint256 transferTokenAmount",
          ],
          data
        );
        return {
          type: ProposalType.TokenTransfer,
          transferToAccount: solidityAddressToAccountIdString(parsedData.transferToAccount),
          tokenToTransfer: solidityAddressToTokenIdString(parsedData.tokenToTransfer),
          transferTokenAmount: convertEthersBigNumberToBigNumberJS(parsedData.transferTokenAmount).toNumber(),
        };
      }
      case GovernanceProposalOperationType.TokenAssociation: {
        const parsedData = abiCoder.decode(["uint256 operationType", "address tokenAddress"], data);
        return {
          type: ProposalType.TokenAssociate,
          tokenAddress: solidityAddressToTokenIdString(parsedData.tokenAddress),
        };
      }
      case GovernanceProposalOperationType.HBarTransfer: {
        const parsedData = abiCoder.decode(
          ["uint256 operationType", "address transferToAccount", "uint256 transferTokenAmount"],
          data
        );
        return {
          type: ProposalType.TokenTransfer,
          transferToAccount: solidityAddressToAccountIdString(parsedData.transferToAccount),
          tokenToTransfer: HBARTokenId,
          transferTokenAmount: parseInt(parsedData.transferTokenAmount),
        };
      }
      default:
        return;
    }
  };

  switch (type) {
    case ProposalType.TokenTransfer:
      return getTokenTransferProposalDataFromHexData(data);
    case ProposalType.UpgradeContract:
      return getUpgradeContractProposalData(data);
    default:
      return;
  }
}

export async function fetchGovernanceDAOLogs(governors: DAOProposalGovernors): Promise<ProposalData[]> {
  const contractInterface = new ethers.utils.Interface(GovernorCountingSimpleInternalJSON.abi);

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
        const proposalDetailsData = getProposalData(proposalEvent.type, proposalEvent.data);
        let contractId = proposalEvent.contractId;
        if (contractId.includes("0.0")) {
          contractId = ContractId.fromString(contractId).toSolidityAddress();
        }
        const response = await DexService.callContract({
          data: contractInterface.encodeFunctionData("state", [proposalEvent.proposalId]),
          from: contractId.toString(),
          to: contractId.toString(),
        });
        const dataParsed = contractInterface.decodeFunctionResult("state", ethers.utils.arrayify(response.data.result));
        /**
         * proposalDetails contain the latest proposal state. Therefore, the common fields derived from
         * proposalDetails should override the same field found in the proposalEvent.
         */

        const isContractUpgradeProposal = proposalEvent.type === ProposalType.UpgradeContract;
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
          const upgradeLogicEVMAddress = await DexService.fetchContractEVMAddress(governors.contractUpgradeLogic);
          const latestAdminLog = isNotNil(changeAdminLogs[0]) ? changeAdminLogs[0] : "";
          isAdminApproved = latestAdminLog?.newAdmin?.toLocaleLowerCase() === upgradeLogicEVMAddress;
          parsedData = { ...proposalDetailsData, currentLogic, proxyAdmin, proxyLogic };
        }
        const isAdminApprovalButtonVisible =
          dataParsed.at(0) === ContractProposalState.Succeeded && !isAdminApproved && isContractUpgradeProposal;
        const currentStateOfProposal = isContractUpgradeProposal
          ? dataParsed.at(0) === ContractProposalState.Succeeded && !isAdminApproved
            ? ContractProposalState.Active
            : dataParsed.at(0)
          : dataParsed.at(0);

        return {
          ...proposalEvent,
          state: currentStateOfProposal,
          ...proposalDetailsData,
          ...parsedData,
          isAdminApproved,
          isAdminApprovalButtonVisible,
        };
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
