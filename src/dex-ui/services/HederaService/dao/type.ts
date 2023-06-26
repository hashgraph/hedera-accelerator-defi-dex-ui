export enum BaseDAOContractFunctions {
  CreateDAO = "createDAO",
}

export enum MultiSigDAOContractFunctions {
  ProposeTransferTransaction = "proposeTransferTransaction",
  ProposeTransaction = "proposeTransaction",
}

export enum GovernorDAOContractFunctions {
  CreateProposal = "createProposal",
  CreateTokenTransferProposal = "createTokenTransferProposal",
  CreateContractUpgradeProposal = "createContractUpgradeProposal",
  CreateTextProposal = "createTextProposal",
}
