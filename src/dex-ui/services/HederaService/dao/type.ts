export enum BaseDAOContractFunctions {
  CreateDAO = "createDAO",
  UpdateDAOInfo = "updateDaoInfo",
}

export enum MultiSigDAOContractFunctions {
  ProposeTransferTransaction = "proposeTransferTransaction",
  ProposeTransaction = "proposeTransaction",
  ProposeTokenAssociation = "proposeTokenAssociateTransaction",
  DepositTokens = "depositTokens",
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
