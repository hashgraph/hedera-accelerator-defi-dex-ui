export enum GovernanceMutations {
  CastVote = "castVote",
  ExecuteProposal = "executeProposal",
  ClaimGODToken = "claimGODToken",
  DeployContract = "deployContract",
  CancelProposal = "cancelProposal",
}

export enum GovernanceQueries {
  Proposals = "proposals",
  FetchHasVoted = "hasVoted",
}

export enum CreateProposalType {
  Text = "Text",
  TokenTransfer = "Token Transfer",
  CreateToken = "Create Token",
  ContractUpgrade = "Contract Upgrade",
}
