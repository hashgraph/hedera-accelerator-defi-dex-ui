import { ProposalDetailsResponse } from "../../JsonRpcService/Governor";
import { MirrorNodeDecodedProposalEvent } from "../../MirrorNodeService";

export type ProposalData = MirrorNodeDecodedProposalEvent & ProposalDetailsResponse;

export enum GovernanceEvent {
  ProposalCreated = "ProposalCreated",
  ProposalExecuted = "ProposalExecuted",
  ProposalCanceled = "ProposalCanceled",
}
