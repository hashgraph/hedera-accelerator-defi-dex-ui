import { BigNumber } from "bignumber.js";
import { AccountId, ContractId } from "@hashgraph/sdk";
import { isNil } from "ramda";
import { DexService } from "../..";
import {
  ContractProposalState,
  Proposal,
  ProposalState,
  ProposalType,
  ProposalStatus,
} from "../../../store/governanceSlice";
import { getTimeRemaining } from "@dex/utils";
import { MirrorNodeDecodedProposalEvent } from "../../../../shared/services/MirrorNodeService";
import { getFulfilledResultsData } from "../../../../shared/services/MirrorNodeService/utils";
import { Contracts, GovernanceTokenId } from "../../constants";
import { GovernanceEvent, ProposalData } from "./type";
import { ethers } from "ethers";
import { solidityAddressToTokenIdString, convertEthersBigNumberToBigNumberJS } from "../..";
import GODHolderJSON from "../../abi/GODHolder.json";
import GovernorCountingSimpleInternalJSON from "../../abi/GovernorCountingSimpleInternal.json";
import { getEventArgumentsByName } from "../..";

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

/**
 * Converts a proposal state into a corresponding status.
 * @param state - A proposal state.
 * @returns The corresponding proposal status.
 */
const getStatus = (state: ProposalState): ProposalStatus | undefined => {
  if (state === ProposalState.Active || state === ProposalState.Pending) {
    return ProposalStatus.Active;
  }
  if (state === ProposalState.Queued || state === ProposalState.Succeeded || state === ProposalState.Executed) {
    return ProposalStatus.Passed;
  }
  if (state === ProposalState.Canceled || state === ProposalState.Defeated || state === ProposalState.Expired) {
    return ProposalStatus.Failed;
  }
  return undefined;
};
/**
 * Fetches all proposal events emitted by a smart contract. The "ProposalCreated",
 * "ProposalExecuted", and "ProposalCanceled" are fetched. These events provide data
 * regarding the contract proposals.
 * @param contractId - The id of the contract to fetch events from.
 * @returns An array of proposal event data.
 */
export const fetchAllProposalEvents = async (): Promise<MirrorNodeDecodedProposalEvent[]> => {
  const tokenTransferEventsResults = DexService.fetchContractProposalEvents(
    ProposalType.TokenTransfer,
    Contracts.Governor.TransferToken.ProxyId
  );
  const createTokenEventsResults = DexService.fetchContractProposalEvents(
    ProposalType.CreateToken,
    Contracts.Governor.CreateToken.ProxyId
  );
  const textProposalEventsResults = DexService.fetchContractProposalEvents(
    ProposalType.Text,
    Contracts.Governor.TextProposal.ProxyId
  );
  const contractUpgradeEventsResults = DexService.fetchContractProposalEvents(
    ProposalType.ContractUpgrade,
    Contracts.Governor.ContractUpgrade.ProxyId
  );
  const proposalEventsResults = await Promise.allSettled([
    tokenTransferEventsResults,
    createTokenEventsResults,
    textProposalEventsResults,
    contractUpgradeEventsResults,
  ]);
  const proposalEvents = getFulfilledResultsData<MirrorNodeDecodedProposalEvent>(proposalEventsResults);
  return proposalEvents;
};

const convertDataToProposal = (proposalData: ProposalData, totalGodTokenSupply: Long | null): Proposal => {
  const proposalState = proposalData.state
    ? (ContractProposalState[proposalData.state] as keyof typeof ContractProposalState)
    : undefined;
  const isProposalTypeValid = Object.values(ProposalType).includes(proposalData.type as ProposalType);
  const { startBlock, endBlock } = proposalData?.duration ?? {};
  return {
    id: proposalData.proposalId,
    contractId: proposalData.contractId,
    type: isProposalTypeValid ? (proposalData.type as ProposalType) : undefined,
    title: proposalData.title,
    description: proposalData.description ?? "",
    link: proposalData.link ?? "",
    author: proposalData.proposer
      ? AccountId.fromSolidityAddress(proposalData.proposer)
      : AccountId.fromString("0.0.34728121"),
    status: proposalState ? getStatus(ProposalState[proposalState]) : undefined,
    timeRemaining: !isNil(startBlock) && !isNil(endBlock) ? getTimeRemaining(startBlock, endBlock) : undefined,
    state: proposalState ? ProposalState[proposalState as keyof typeof ProposalState] : undefined,
    timestamp: proposalData.timestamp,
    transferFromAccount: proposalData.transferFromAccount,
    transferToAccount: proposalData.transferToAccount,
    tokenToTransfer: proposalData.tokenToTransfer,
    transferTokenAmount: proposalData.transferTokenAmount,
    voted: proposalData.votingInformation?.voted,
    votedUser: AccountId.fromSolidityAddress(proposalData.votingInformation?.votedUser ?? "").toString(),
    isQuorumReached: proposalData.votingInformation?.isQuorumReached,
    endBlock,
    votes: {
      yes: BigNumber(proposalData?.votingInformation?.forVotes ?? 0),
      no: BigNumber(proposalData?.votingInformation?.againstVotes ?? 0),
      abstain: BigNumber(proposalData?.votingInformation?.abstainVotes ?? 0),
      quorum: BigNumber(proposalData.votingInformation?.quorumValue ?? 0),
      max: !isNil(totalGodTokenSupply) ? new BigNumber(totalGodTokenSupply.toString()) : BigNumber(0),
    },
  };
};

const fetchAllProposalData = async (
  proposalEvents: MirrorNodeDecodedProposalEvent[],
  accountId: string
): Promise<ProposalData[]> => {
  const contractInterface = new ethers.utils.Interface(GovernorCountingSimpleInternalJSON.abi);
  const proposalEventsWithDetailsResults = await Promise.allSettled(
    proposalEvents.map(async (proposalEvent: MirrorNodeDecodedProposalEvent) => {
      let contractId = proposalEvent.contractId;
      if (contractId.includes("0.0")) {
        contractId = ContractId.fromString(contractId).toSolidityAddress();
      }
      const response = await DexService.callContract({
        block: "latest",
        data: contractInterface.encodeFunctionData("state", [proposalEvent.proposalId]),
        estimate: false,
        from: AccountId.fromString(accountId).toSolidityAddress(),
        gas: 9000000,
        gasPrice: 100000000,
        to: contractId,
        value: 0,
      });
      const dataParsed = contractInterface.decodeFunctionResult("state", ethers.utils.arrayify(response.data.result));
      return { ...proposalEvent, state: dataParsed.at(0) };
    })
  );
  const proposalEventsWithDetails = proposalEventsWithDetailsResults.map((event: PromiseSettledResult<any>) => {
    return event.status === "fulfilled" ? event.value : undefined;
  });
  return proposalEventsWithDetails;
};

export const fetchAllProposals = async (accountId: string): Promise<Proposal[]> => {
  const proposalEvents = await fetchAllProposalEvents();
  const proposalDetails = await fetchAllProposalData(proposalEvents, accountId);
  const totalGodTokenSupply = await DexService.fetchTokenData(GovernanceTokenId);
  const proposals = proposalDetails.map((proposalData) => {
    return convertDataToProposal(proposalData, totalGodTokenSupply.data.total_supply);
  });
  return proposals;
};

async function fetchProposalDetails(proposalEvent: MirrorNodeDecodedProposalEvent, accountId: string) {
  const contractInterface = new ethers.utils.Interface(GovernorCountingSimpleInternalJSON.abi);
  let contractId = proposalEvent.contractId;
  if (contractId.includes("0.0")) {
    contractId = ContractId.fromString(contractId).toSolidityAddress();
  }
  const response = await DexService.callContract({
    block: "latest",
    data: contractInterface.encodeFunctionData("state", [proposalEvent.proposalId]),
    estimate: false,
    from: AccountId.fromString(accountId).toSolidityAddress(),
    gas: 9000000,
    gasPrice: 100000000,
    to: contractId,
    value: 0,
  });
  const dataParsed = contractInterface.decodeFunctionResult("state", ethers.utils.arrayify(response.data.result));
  const tokenTransferDetails = getTokenTransferDetailsFromHexData(proposalEvent.data);
  return { ...proposalEvent, ...tokenTransferDetails, state: dataParsed.at(0) };
}

export async function fetchProposal(id: string, accountId: string): Promise<Proposal> {
  const proposalEvents = await fetchAllProposalEvents();
  const proposalEvent = proposalEvents.find(
    (proposalEvent) => proposalEvent.proposalId === id
  ) as MirrorNodeDecodedProposalEvent;
  const proposalDetails = await fetchProposalDetails(proposalEvent, accountId);
  const totalGodTokenSupply = await DexService.fetchTokenData(GovernanceTokenId);
  const proposal = convertDataToProposal(proposalDetails, totalGodTokenSupply.data.total_supply);
  return proposal;
}

export async function fetchCanUserClaimGODTokens(
  tokenHolderAddress: string,
  accountId: string
): Promise<boolean | undefined> {
  const logs = await DexService.fetchParsedEventLogs(
    tokenHolderAddress,
    new ethers.utils.Interface(GODHolderJSON.abi),
    [GovernanceEvent.CanClaimAmount]
  );

  const decodedEvents = logs.map((log) => {
    return getEventArgumentsByName<{ canClaim: boolean; user: string }>(log.args);
  });

  /** If events are empty which means user has not participated in any proposal */
  if (decodedEvents.length === 0) return true;
  const eventObj = decodedEvents.find(
    (eventData) => AccountId.fromSolidityAddress(eventData.user).toString() === accountId
  );
  return eventObj?.canClaim;
}
