export enum DAOQueries {
  DAOs = "daos",
  Proposals = "proposals",
}

export enum DAOMutations {
  CreateDAO = "CreateDAO",
  CreateMultiSigProposal = "CreateMultiSigProposal",
  CreateTokenTransferProposal = "CreateTokenTransferProposal",
  CreateAddMemberProposal = "CreateAddMemberProposal",
  CreateDeleteMemberProposal = "CreateDeleteMemberProposal",
  CreateReplaceMemberProposal = "CreateReplaceMemberProposal",
  CreateChangeThresholdProposal = "CreateChangeThresholdProposal",
  ApproveProposal = "ApproveProposal",
  ExecuteProposal = "ExecuteProposal",
}
