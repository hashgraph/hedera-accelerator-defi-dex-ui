export enum BaseDAOContractFunctions {
  CreateDAO = "createDAO",
}

export enum MultiSigDAOContractFunctions {
  ProposeTransferTransaction = "proposeTransferTransaction",
  ProposeTransaction = "proposeTransaction",
  UpdateDAOInfo = "updateDaoInfo",
}

export enum GovernorDAOContractFunctions {
  CreateProposal = "createProposal",
  CreateTokenTransferProposal = "createTokenTransferProposal",
  CreateContractUpgradeProposal = "createContractUpgradeProposal",
  CreateTextProposal = "createTextProposal",
}
