export enum BaseDAOContractFunctions {
  CreateDAO = "createDAO",
}

export enum MultiSigDAOContractFunctions {
  ProposeTransferTransaction = "proposeTransferTransaction",
  ProposeTransaction = "proposeTransaction",
  UpdateDAOInfo = "updateDaoInfo",
  ProposeTokenAssociation = "proposeTokenAssociateTransaction",
}

export enum GovernorDAOContractFunctions {
  CreateProposal = "createProposal",
  CreateTokenTransferProposal = "createTokenTransferProposal",
  CreateContractUpgradeProposal = "createContractUpgradeProposal",
  CreateTextProposal = "createTextProposal",
}

export enum NFTDAOContractFunctions {
  MintTokens = "mintTokens",
}
