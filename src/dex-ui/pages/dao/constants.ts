import { TagVariant } from "@dex-ui-components";
import { ProposalState } from "@dex-ui/store/governanceSlice";
import { ProposalStatus } from "@hooks";

export const ProposalStatusAsTagVariant: Readonly<{ [key in ProposalStatus]: TagVariant }> = {
  [ProposalStatus.Pending]: TagVariant.Active,
  [ProposalStatus.Queued]: TagVariant.Queued,
  [ProposalStatus.Success]: TagVariant.Succeeded,
  [ProposalStatus.Failed]: TagVariant.Failed,
};

export const ProposalStateAsTagVariant: Readonly<{ [key in ProposalState]: TagVariant }> = {
  [ProposalState.Pending]: TagVariant.Active,
  [ProposalState.Active]: TagVariant.Active,
  [ProposalState.Canceled]: TagVariant.Failed,
  [ProposalState.Defeated]: TagVariant.Failed,
  [ProposalState.Succeeded]: TagVariant.Queued,
  [ProposalState.Queued]: TagVariant.Queued,
  [ProposalState.Expired]: TagVariant.Failed,
  [ProposalState.Executed]: TagVariant.Succeeded,
};
