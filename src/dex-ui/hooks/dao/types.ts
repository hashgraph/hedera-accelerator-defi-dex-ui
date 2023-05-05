export enum DAOQueries {
  DAOs = "daos",
  Transactions = "transactions",
}

export enum DAOMutations {
  CreateDAO = "CreateDAO",
  CreateMultiSigTransaction = "CreateMultiSigTransaction",
  CreateAddMemberTransaction = "CreateAddMemberTransaction",
  CreateDeleteMemberTransaction = "CreateDeleteMemberTransaction",
  CreateReplaceMemberTransaction = "CreateReplaceMemberTransaction",
  CreateChangeThresholdTransaction = "CreateChangeThresholdTransaction",
  ApproveTransaction = "ApproveTransaction",
  ExecuteTransaction = "ExecuteTransaction",
}
