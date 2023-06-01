import { TagVariant } from "@dex-ui-components";
import { ProposalStatus } from "@hooks";

export const ProposalStatusAsTagVariant: Readonly<{ [key in ProposalStatus]: TagVariant }> = {
  [ProposalStatus.Pending]: TagVariant.Active,
  [ProposalStatus.Queued]: TagVariant.Queued,
  [ProposalStatus.Success]: TagVariant.Succeeded,
  [ProposalStatus.Failed]: TagVariant.Failed,
};
