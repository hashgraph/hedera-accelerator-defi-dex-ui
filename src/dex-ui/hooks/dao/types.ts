export enum DAOQueries {
  DAOs = "daos",
  Proposals = "proposals",
}

export enum DAOMutations {
  CreateDAO = "CreateDAO",
  CreateMultiSigProposal = "CreateMultiSigProposal",
  CreateAddMemberProposal = "CreateAddMemberProposal",
  CreateDeleteMemberProposal = "CreateDeleteMemberProposal",
  CreateReplaceMemberProposal = "CreateReplaceMemberProposal",
  CreateChangeThresholdProposal = "CreateChangeThresholdProposal",
  ApproveProposal = "ApproveProposal",
  ExecuteProposal = "ExecuteProposal",
}
