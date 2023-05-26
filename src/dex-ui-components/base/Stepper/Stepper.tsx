import { Stepper, Step, StepLabel, Orientation } from "@material-ui/core";
import { Color } from "../../themes";
import { Flex } from "@chakra-ui/layout";
import { Box, Text } from "@chakra-ui/react";
import { StepperStyles } from "./StepperStyles";
import { ProposalStateIcon, ProposalState } from "./types";
import { ActiveStepIcon, CancelledStepIcon, DisabledStepIcon, CompletedStepIcon } from "../Icons";

const GetStatusIcon = (iconType: string) => {
  switch (iconType) {
    case ProposalStateIcon.Active:
      return <ActiveStepIcon />;
    case ProposalStateIcon.Completed:
      return <CompletedStepIcon />;
    case ProposalStateIcon.Disabled:
      return <DisabledStepIcon />;
    case ProposalStateIcon.Cancelled:
      return <CancelledStepIcon color={Color.Black_01} fillOpacity="0.54" boxSize="8" />;
    default:
      break;
  }
};

interface StepperUIProps {
  states: ProposalState[];
  orientation?: Orientation;
}

function StepperUI(props: StepperUIProps) {
  const { orientation = "vertical", states } = props;
  return (
    <Box sx={StepperStyles} marginLeft="-10px">
      <Stepper orientation={orientation}>
        {states.length !== 0 &&
          states.map((state) => {
            return (
              <Step key={state.status}>
                <Flex flexDirection="row" gap="13.5px">
                  {GetStatusIcon(state.iconType)}
                  <StepLabel>
                    <Flex flexDirection="row" gap="4px">
                      <Text
                        textStyle="b4"
                        color={state.iconType === ProposalStateIcon.Disabled ? Color.Grey_01 : Color.Text_Primary}
                      >
                        {state.status}
                      </Text>
                      {state.timeRemaining && (
                        <Text textStyle="b2" color={Color.Grey_02}>
                          {` - ${state.timeRemaining}`}
                        </Text>
                      )}
                    </Flex>
                  </StepLabel>
                </Flex>
              </Step>
            );
          })}
      </Stepper>
    </Box>
  );
}

export { StepperUI };
