type GovernanceEventNames = "ProposalCreated" | "ProposalExecuted" | "ProposalCanceled";

export interface EventAbi {
  type: "event";
  anonymous: boolean;
  name: GovernanceEventNames;
  inputs: Array<any>;
}
