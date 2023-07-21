import { Flex } from "@chakra-ui/react";
import { StepProps, Steps } from "@dex-ui-components";
import { ProposalState } from "@dex-ui/store/governanceSlice";

export enum StepperProposalStatus {
  Created = "Created",
  Active = "Active",
  Queued = "Queued to Execute",
  Executed = "Executed",
  Failed = "Failed",
  Defeated = "Defeated",
}

interface ProposalDetailsStepperProps {
  state?: ProposalState;
  isExecutionProcessing: boolean;
  hasExecutionFailed: boolean;
}

export function GovernanceProposalDetailsStepper(props: ProposalDetailsStepperProps) {
  const { state, isExecutionProcessing, hasExecutionFailed } = props;
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
  } else if (state === ProposalState.Canceled || state === ProposalState.Expired) {
    steps = [
      {
        label: StepperProposalStatus.Created,
      },
      {
        label: StepperProposalStatus.Active,
      },
      {
        label: StepperProposalStatus.Failed,
        isError: true,
      },
    ];
    activeStep = 2;
  } else if (state === ProposalState.Defeated) {
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

  return (
    <Flex layerStyle="content-box">
      <Steps activeStep={activeStep} steps={steps} />
    </Flex>
  );
}
