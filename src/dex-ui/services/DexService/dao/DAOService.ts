import { ethers } from "ethers";
import { AccountId } from "@hashgraph/sdk";
import { DexService } from "../..";
import { Contracts } from "../../constants";
import { getEventArgumentsByName } from "../../utils";
import GovernanceDAOFactoryJSON from "../../abi/GovernanceDAOFactory.json";
import MultiSigDAOFactoryJSON from "../../abi/MultiSigDAOFactory.json";
import HederaGnosisSafeJSON from "../../abi/HederaGnosisSafe.json";
import MultiSigDAOJSON from "../../abi/MultiSigDAO.json";

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
} from "./types";

async function fetchMultiSigDAOs(eventTypes?: string[]): Promise<MultiSigDAODetails[]> {
  const logs = await DexService.fetchParsedEventLogs(
    Contracts.MultiSigDAOFactory.ProxyId,
    new ethers.utils.Interface(MultiSigDAOFactoryJSON.abi),
    eventTypes
  );
  return logs.map((log): MultiSigDAODetails => {
    const argsWithName = getEventArgumentsByName<MultiSigDAOCreatedEventArgs>(log.args, ["owners"]);
    const { daoAddress, admin, name, logoUrl, isPrivate, safeAddress, owners, threshold } = argsWithName;
    return {
      type: DAOType.MultiSig,
      accountId: AccountId.fromSolidityAddress(daoAddress).toString(),
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
      logoUrl,
      isPrivate,
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
    const { daoAddress, admin, name, logoUrl, isPrivate, tokenAddress, quorumThreshold, votingDelay, votingPeriod } =
      argsWithName;
    return {
      type: DAOType.GovernanceToken,
      accountId: AccountId.fromSolidityAddress(daoAddress).toString(),
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
      logoUrl,
      isPrivate,
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
    const { daoAddress, admin, name, logoUrl, isPrivate, tokenAddress, quorumThreshold, votingDelay, votingPeriod } =
      argsWithName;
    return {
      type: DAOType.NFT,
      accountId: AccountId.fromSolidityAddress(daoAddress).toString(),
      adminId: AccountId.fromSolidityAddress(admin).toString(),
      name,
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
      const parsedData = abiCoder.decode(
        ["address token", "address receiver", "uint256 amount"],
        ethers.utils.hexDataSlice(event.args.info.data, 4)
      );
      const eventClone: ethers.utils.LogDescription = structuredClone(event);
      eventClone.args.info.data = parsedData;
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
