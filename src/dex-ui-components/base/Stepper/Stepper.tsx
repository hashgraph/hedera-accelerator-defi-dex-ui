import { Stepper, Step, StepLabel } from "@material-ui/core";
import { Color } from "../../themes";
import { Flex } from "@chakra-ui/layout";
import { Box, Text } from "@chakra-ui/react";
import { StepperStyles } from "./StepperStyles";
import { StepperState, ProposalStateIcon } from "./types";
import { ActiveStepIcon, CancelledStepIcon, DisbaledStepIcon, CompletedStepIcon } from "../Icons";

const GetStatusIcon = (iconType: string) => {
  switch (iconType) {
    case ProposalStateIcon.Active:
      return <ActiveStepIcon />;
    case ProposalStateIcon.Completed:
      return <CompletedStepIcon />;
    case ProposalStateIcon.Disabled:
      return <DisbaledStepIcon />;
    case ProposalStateIcon.Cancelled:
      return <CancelledStepIcon />;
    default:
      break;
  }
};

function StepperUI(props: StepperState) {
  const { states } = props;
  return (
    <Box sx={StepperStyles} marginLeft="-10px">
      <Stepper orientation="vertical">
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
