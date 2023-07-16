export enum GovernanceMutations {
  CastVote = "castVote",
  ExecuteProposal = "executeProposal",
  ClaimGODToken = "claimGODToken",
  CancelProposal = "cancelProposal",
  CreateTextProposal = "createTextProposal",
  CreateNewTokenProposal = "createNewTokenProposal",
  CreateTokenTransferProposal = "createTokenTransferProposal",
  CreateContractUpgradeProposal = "createContractUpgradeProposal",
}

export enum GovernanceQueries {
  Proposals = "proposals",
  FetchHasVoted = "hasVoted",
  FetchLockGODToken = "fetchLockGODToken",
  FetchCanUnlockGODToken = "fetchCanUnlockGODToken",
  FetchLatestBlockNumber = "FetchLatestBlockNumber",
}

export enum CreateProposalType {
  Text = "Text",
  TokenTransfer = "Token Transfer",
  CreateToken = "Create Token",
  ContractUpgrade = "Contract Upgrade",
}
