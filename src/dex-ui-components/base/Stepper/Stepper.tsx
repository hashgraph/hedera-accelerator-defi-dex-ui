import Stepper, { Step, StepperContent } from "react-material-stepper";
import 'react-material-stepper/dist/react-stepper.css';
import { Box, Text } from "@chakra-ui/react";
interface ProposalStates {
  status: string;
  iconType: string;
  timeRemaining?: string | undefined;
}
interface StepperState {
  state: ProposalStates[] | undefined;
}

function StepperUI(props: StepperState | undefined) {
  return (
    <Box>
      <Stepper vertical={true} initialStep={1}>
        <Step
          stepId={1}
          data="Step 1 initial state"
          title="Step One"
          description="This step is optional"
        >
          <StepperContent>
            Step1 resolved:
          </StepperContent>
          {/* <Text>Step 1</Text> */}
        </Step>
      </Stepper>
    </Box>
  );
}

export { StepperUI };
