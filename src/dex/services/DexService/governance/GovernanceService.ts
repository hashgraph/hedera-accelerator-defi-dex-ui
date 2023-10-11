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
  GovernanceProposalType,
} from "../../../store/governanceSlice";
import { MirrorNodeDecodedProposalEvent } from "../../../../shared/services/MirrorNodeService";
import { Contracts, GovernanceTokenId } from "../../constants";
import { GovernanceEvent, ProposalData, CanClaimDetails } from "./type";
import { ethers } from "ethers";
import { convertEthersBigNumberToBigNumberJS } from "../..";
import GODHolderJSON from "../../abi/GODHolder.json";
import GovernorCountingSimpleInternalJSON from "../../abi/GovernorCountingSimpleInternal.json";
import { getEventArgumentsByName } from "../..";
import Long from "long";
import { solidityAddressToAccountIdString, solidityAddressToTokenIdString } from "@shared/utils";

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
    transferFromAccount: solidityAddressToAccountIdString(parsedData.transferFromAccount),
    transferToAccount: solidityAddressToAccountIdString(parsedData.transferToAccount),
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
  return await DexService.fetchContractProposalEvents(Contracts.Governor.TransferToken.ProxyId);
};

const convertProposalType = (proposalType: number): ProposalType => {
  switch (proposalType) {
    case GovernanceProposalType.SET_TEXT: {
      return ProposalType.Text;
    }
    case GovernanceProposalType.UPGRADE_PROXY: {
      return ProposalType.ContractUpgrade;
    }
    default: {
      return ProposalType.TokenTransfer;
    }
  }
};

const convertDataToProposal = (
  proposalData: MirrorNodeDecodedProposalEvent,
  totalGodTokenSupply: Long | null
): Proposal => {
  const proposalState = proposalData.state
    ? (ContractProposalState[proposalData.state] as keyof typeof ContractProposalState)
    : undefined;
  const isProposalTypeValid = Object.values(ProposalType).includes(
    convertProposalType(proposalData.coreInformation.inputs.proposalType) as ProposalType
  );
  return {
    id: proposalData.proposalId,
    contractId: proposalData.contractId,
    type: isProposalTypeValid ? convertProposalType(proposalData.coreInformation.inputs.proposalType) : undefined,
    title: proposalData.coreInformation.inputs.title,
    description: proposalData.coreInformation.inputs.description ?? "",
    link: proposalData.coreInformation.inputs.discussionLink ?? "",
    author: proposalData.coreInformation.creator
      ? AccountId.fromString(solidityAddressToAccountIdString(proposalData.coreInformation.creator))
      : AccountId.fromString("0.0.34728121"),
    status: proposalState ? getStatus(ProposalState[proposalState]) : undefined,
    timeRemaining: undefined,
    state: proposalState ? ProposalState[proposalState as keyof typeof ProposalState] : undefined,
    timestamp: proposalData.timestamp,
    transferFromAccount: "",
    transferToAccount: "",
    tokenToTransfer: "",
    transferTokenAmount: 0,
    voted: proposalData.votingInformation?.hasVoted,
    votedUser: solidityAddressToAccountIdString(""),
    isQuorumReached: proposalData.votingInformation?.isQuorumReached,
    endBlock: undefined,
    votes: {
      yes: BigNumber(proposalData?.votingInformation?.forVotes ?? 0),
      no: BigNumber(proposalData?.votingInformation?.againstVotes ?? 0),
      abstain: BigNumber(proposalData?.votingInformation?.abstainVotes ?? 0),
      quorum: BigNumber(proposalData.votingInformation?.quorumValue ?? 0),
      max: !isNil(totalGodTokenSupply) ? new BigNumber(totalGodTokenSupply.toString()) : BigNumber(0),
    },
  };
};

const fetchAllProposalData = async (proposalEvents: MirrorNodeDecodedProposalEvent[]): Promise<ProposalData[]> => {
  const contractInterface = new ethers.utils.Interface(GovernorCountingSimpleInternalJSON.abi);
  const proposalEventsWithDetailsResults = await Promise.allSettled(
    proposalEvents.map(async (proposalEvent: MirrorNodeDecodedProposalEvent) => {
      let contractId = proposalEvent.contractId;
      if (contractId.includes("0.0")) {
        contractId = ContractId.fromString(contractId).toSolidityAddress();
      }
      const response = await DexService.callContract({
        data: contractInterface.encodeFunctionData("state", [proposalEvent.proposalId]),
        from: contractId,
        to: contractId,
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

export const fetchAllProposals = async (): Promise<Proposal[]> => {
  const proposalEvents = await fetchAllProposalEvents();
  const proposalDetails = await fetchAllProposalData(proposalEvents);
  const totalGodTokenSupply = await DexService.fetchTokenData(GovernanceTokenId);
  const proposals = proposalDetails.map((proposalData) => {
    return convertDataToProposal(proposalData, totalGodTokenSupply.data.total_supply);
  });
  return proposals;
};

async function fetchProposalDetails(proposalEvent: MirrorNodeDecodedProposalEvent) {
  const contractInterface = new ethers.utils.Interface(GovernorCountingSimpleInternalJSON.abi);
  let contractId = proposalEvent.contractId;
  if (contractId.includes("0.0")) {
    contractId = ContractId.fromString(contractId).toSolidityAddress();
  }
  const response = await DexService.callContract({
    data: contractInterface.encodeFunctionData("state", [proposalEvent.proposalId]),
    from: contractId,
    to: contractId,
  });
  const dataParsed = contractInterface.decodeFunctionResult("state", ethers.utils.arrayify(response.data.result));
  const tokenTransferDetails = getTokenTransferDetailsFromHexData(undefined);
  return { ...proposalEvent, ...tokenTransferDetails, state: dataParsed.at(0) };
}

export async function fetchProposal(id: string): Promise<Proposal> {
  const proposalEvents = await fetchAllProposalEvents();
  const proposalEvent = proposalEvents.find(
    (proposalEvent) => proposalEvent.proposalId === id
  ) as MirrorNodeDecodedProposalEvent;
  const proposalDetails = await fetchProposalDetails(proposalEvent);
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
    return getEventArgumentsByName<CanClaimDetails>(log.args);
  });

  const eventObj = decodedEvents?.find((eventData) => solidityAddressToAccountIdString(eventData.user) === accountId);
  return eventObj?.canClaim ?? true;
}
