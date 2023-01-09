export enum GovernanceMutations {
  CastVote = "castVote",
  ChangeVote = "changeVote",
  ExecuteProposal = "executeProposal",
  ClaimGODToken = "claimGODToken",
  DeployContract = "deployContract",
}

export enum GovernanceQueries {
  FetchAllProposals = "fetchAllProposals",
  FetchHasVoted = "hasVoted",
}

export enum CreateProposalType {
  Text = "Text",
  TokenTransfer = "Token Transfer",
  CreateToken = "Create Token",
  ContractUpgrade = "Contract Upgrade",
}
