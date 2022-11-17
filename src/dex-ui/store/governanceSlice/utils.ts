import { ProposalState, ProposalStatus } from "./type";

const getStatus = (state: ProposalState): ProposalStatus | undefined => {
  if (state === ProposalState.Active || state === ProposalState.Pending) {
    return ProposalStatus.Active;
  }

  if (state === ProposalState.Queued || state === ProposalState.Succeeded || state === ProposalState.Executed) {
    return ProposalStatus.Passed;
  }

  if (state === ProposalState.Canceled || state === ProposalState.Defeated || state === ProposalState.Expired) {
    return ProposalStatus.Failed;
  }

  return undefined;
};

export { getStatus };
