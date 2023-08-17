import { Color } from "../../shared/ui-kit";
import { ProposalStatus, ProposalState } from "../store/governanceSlice";

export const getStatusColor = (status: ProposalStatus | undefined, state: ProposalState | undefined): string => {
  if (status === ProposalStatus.Active) {
    if (state === ProposalState.Active || state === ProposalState.Pending) {
      return Color.Teal_02;
    }
  }
  if (status === ProposalStatus.Passed && state === ProposalState.Queued) {
    return Color.Yellow_02;
  }
  if (status === ProposalStatus.Passed) {
    if (state === ProposalState.Executed || state === ProposalState.Succeeded) {
      return Color.Green_02;
    }
  }
  if (status === ProposalStatus.Failed) {
    if (state === ProposalState.Canceled || state === ProposalState.Expired || state === ProposalState.Defeated) {
      return Color.Red_02;
    }
  }
  return "";
};

export const getShortDescription = (description: string) => {
  const stringWithoutHTML = description.replace(/<[^>]+>/g, "");
  return stringWithoutHTML.length > 80 ? stringWithoutHTML.slice(0, 80 - 1) + "..." : stringWithoutHTML;
};
