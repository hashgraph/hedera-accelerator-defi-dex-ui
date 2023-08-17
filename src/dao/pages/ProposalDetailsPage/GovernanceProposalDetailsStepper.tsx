import { Flex } from "@chakra-ui/react";
import { Steps } from "@shared/ui-kit";
import { ProposalState } from "@dex/store";
import { getProposalSteps } from "../utils";

interface ProposalDetailsStepperProps {
  state?: ProposalState;
  isExecutionProcessing: boolean;
  hasExecutionFailed: boolean;
}

export function GovernanceProposalDetailsStepper(props: ProposalDetailsStepperProps) {
  const { state, isExecutionProcessing, hasExecutionFailed } = props;
  const { steps, activeStep } = getProposalSteps(
    state ?? ProposalState.Active,
    isExecutionProcessing,
    hasExecutionFailed
  );

  return (
    <Flex layerStyle="content-box">
      <Steps activeStep={activeStep} steps={steps} />
    </Flex>
  );
}
