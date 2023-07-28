import { StepProps } from "@dex-ui-components";
import { ProposalState } from "@dex-ui/store/governanceSlice";
import { SENTINEL_OWNER } from "@services";

export function getDAOLinksRecordArray(links: string[]): Record<"value", string>[] {
  const arrayOfRecords = links.map((linkString) => {
    return { value: linkString };
  });
  return arrayOfRecords;
}

interface GetPreviousMemberAddressParams {
  memberId: string;
  owners: string[];
}

export function getPreviousMemberAddress(params: GetPreviousMemberAddressParams): string {
  const { memberId, owners } = params;
  const index = owners.findIndex((owner) => owner === memberId);
  const prevMemberAddress = index === 0 ? SENTINEL_OWNER : owners[index - 1];
  return prevMemberAddress;
}

enum StepperProposalStatus {
  Created = "Created",
  Active = "Active",
  Queued = "Queued to Execute",
  Executed = "Executed",
  Defeated = "Defeated",
  Cancelled = "Cancelled",
}

export function getProposalSteps(
  state: ProposalState,
  isExecutionProcessing: boolean,
  hasExecutionFailed: boolean
): { steps: StepProps[]; activeStep: number } {
  let steps: StepProps[] = [];
  let activeStep = 0;
  if (
    state === ProposalState.Pending ||
    state === ProposalState.Active ||
    state === ProposalState.Succeeded ||
    state === ProposalState.Queued ||
    state === ProposalState.Executed
  ) {
    steps = [
      {
        label: StepperProposalStatus.Created,
      },
      {
        label: StepperProposalStatus.Active,
      },
      {
        label: StepperProposalStatus.Queued,
        isLoading: isExecutionProcessing,
        isError: hasExecutionFailed,
      },
      {
        label: StepperProposalStatus.Executed,
      },
    ];
    if (state === ProposalState.Pending || state === ProposalState.Active) {
      activeStep = 1;
    } else if (state === ProposalState.Succeeded || state === ProposalState.Queued) {
      activeStep = 2;
    } else {
      activeStep = 4;
    }
  } else if (state === ProposalState.Canceled) {
    steps = [
      {
        label: StepperProposalStatus.Created,
      },
      {
        label: StepperProposalStatus.Active,
      },
      {
        label: StepperProposalStatus.Cancelled,
        isError: true,
      },
    ];
    activeStep = 2;
  } else if (state === ProposalState.Defeated || state === ProposalState.Expired) {
    steps = [
      {
        label: StepperProposalStatus.Created,
      },
      {
        label: StepperProposalStatus.Active,
      },
      {
        label: StepperProposalStatus.Defeated,
        isError: true,
      },
    ];
    activeStep = 2;
  }
  return { steps, activeStep };
}
