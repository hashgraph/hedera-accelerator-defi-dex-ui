export enum BaseDAOContractFunctions {
  CreateDAO = "createDAO",
  UpdateDAOInfo = "updateDaoInfo",
}

export enum MultiSigDAOContractFunctions {
  ProposeTransferTransaction = "proposeTransferTransaction",
  ProposeTransaction = "proposeTransaction",
  ProposeTokenAssociation = "proposeTokenAssociateTransaction",
  DepositTokens = "depositTokens",
  ProposeDAOUpgrade = "proposeUpgradeProxyTransaction",
}

export enum GovernorDAOContractFunctions {
  CreateProposal = "createProposal",
  CreateTokenAssociationProposal = "createTokenAssociateProposal",
}

export enum NFTDAOContractFunctions {
  MintTokens = "mintTokens",
}
