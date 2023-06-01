import { Flex } from "@chakra-ui/react";
import { StepProps, Steps } from "@dex-ui-components";
import { ProposalStatus } from "@hooks";

export enum StepperProposalStatus {
  Created = "Created",
  Active = "Active",
  Queued = "Queued to Execute",
  Executed = "Executed",
  Failed = "Failed",
}

export const ProposalStatusAsStep: Readonly<{ [key in ProposalStatus]: number }> = {
  [ProposalStatus.Pending]: 1,
  [ProposalStatus.Queued]: 2,
  [ProposalStatus.Failed]: 3,
  [ProposalStatus.Success]: 4,
};

interface ProposalDetailsStepperProps {
  status: ProposalStatus;
  isThresholdReached: boolean;
  isExecutionProcessing: boolean;
  hasExecutionFailed: boolean;
}

export function ProposalDetailsStepper(props: ProposalDetailsStepperProps) {
  const { status, isThresholdReached, isExecutionProcessing, hasExecutionFailed } = props;

  const proposalStatus = status === ProposalStatus.Pending && isThresholdReached ? ProposalStatus.Queued : status;
  const hasProposalFailed = proposalStatus === ProposalStatus.Failed;

  const steps: StepProps[] = [
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
      label: proposalStatus === ProposalStatus.Failed ? StepperProposalStatus.Failed : StepperProposalStatus.Executed,
      isError: hasProposalFailed,
    },
  ];

  const activeStep = ProposalStatusAsStep[proposalStatus];

  return (
    <Flex layerStyle="content-box">
      <Steps activeStep={activeStep} steps={steps} />
    </Flex>
  );
}
