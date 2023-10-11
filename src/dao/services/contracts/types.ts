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
  SetText = "setText",
  Associate = "associate",
  TRANSFER = "transfer",
  UpgradeProxy = "upgradeProxy",
}

export enum NFTDAOContractFunctions {
  MintTokens = "mintTokens",
}
