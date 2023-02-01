import { Stepper, Step, StepLabel } from "@material-ui/core";
import { CheckCircleIcon, createIcon } from "@chakra-ui/icons";
import { Color } from "../../themes";
import { Flex } from "@chakra-ui/layout";
import { Box, Text } from "@chakra-ui/react";
import { StepperStyles } from "./StepperStyles";
import { StepperState, ProposalStateIcon } from "./types";

const DisabledIcon = createIcon({
  displayName: "DisabledIcon",
  viewBox: "0 0 25.5 25.5",
  path: [
    <path
      fill={Color.Grey_01}
      d="M13 0.5C6.1 0.5 0.5 6.1 0.5 13C0.5 19.9 6.1 25.5 13 25.5C19.9 25.5
      25.5 19.9 25.5 13C25.5 6.1 19.9 0.5 13 0.5ZM13 23C7.475 23 3 18.525 3
      13C3 7.475 7.475 3 13 3C18.525 3 23 7.475 23 13C23 18.525 18.525 23 13 23Z"
    />,
  ],
});

const ActiveIcon = createIcon({
  displayName: "ActiveIcon",
  viewBox: "0 0 25.5 25.5",
  path: [
    <path
      fill={Color.Teal_01}
      d="M10,5.5C10,7.9853,7.9853,10,5.5,10S1,7.9853,1,5.5S3.0147,1,5.5,1S10,3.0147,10,5.5z"
      transform="translate(7.5,7.2)"
      scale="100px"
    />,
    <path
      fill={Color.Teal_01}
      d="M13 0.5C6.1 0.5 0.5 6.1 0.5 13C0.5 19.9 6.1 25.5 13 25.5C19.9 25.5 25.5 19.9
      25.5 13C25.5 6.1 19.9 0.5 13 0.5ZM13 23C7.475 23 3 18.525 3 13C3 7.475
      7.475 3 13 3C18.525 3 23 7.475 23 13C23 18.525 18.525 23 13 23Z"
    />,
  ],
});

const CancelledIcon = createIcon({
  displayName: "CancelledIcon",
  viewBox: "0 0 25.5 25.5",
  path: [
    <path
      fill={Color.Black_01}
      d="M13 0.5C6.0875 0.5 0.5 6.0875 0.5 13C0.5 19.9125 6.0875 25.5 13 25.5C19.9125
      25.5 25.5 19.9125 25.5 13C25.5 6.0875 19.9125 0.5 13 0.5ZM18.375 18.375C17.8875
      18.8625 17.1 18.8625 16.6125 18.375L13 14.7625L9.3875 18.375C8.9 18.8625 8.1125
      18.8625 7.625 18.375C7.1375 17.8875 7.1375 17.1 7.625 16.6125L11.2375 13L7.625
      9.3875C7.1375 8.9 7.1375 8.1125 7.625 7.625C8.1125 7.1375 8.9 7.1375 9.3875 7.625L13
      11.2375L16.6125 7.625C17.1 7.1375 17.8875 7.1375 18.375 7.625C18.8625 8.1125
      18.8625 8.9 18.375 9.3875L14.7625 13L18.375 16.6125C18.85 17.0875 18.85 17.8875 18.375 18.375Z"
    />,
  ],
});

const GetStatusIcon = (iconType: string) => {
  switch (iconType) {
    case ProposalStateIcon.Active:
      return <ActiveIcon color={Color.Teal_01} height="8" width="8" />;
    case ProposalStateIcon.Completed:
      return <CheckCircleIcon color={Color.Teal_01} height="8" width="8" />;
    case ProposalStateIcon.Disabled:
      return <DisabledIcon height="8" width="8" />;
    case ProposalStateIcon.Cancelled:
      return <CancelledIcon height="8" width="8" />;
    default:
      break;
  }
};

function StepperUI(props: StepperState) {
  const { states } = props;
  return (
    <Box sx={StepperStyles}>
      <Stepper orientation="vertical">
        {states.length !== 0 &&
          states.map((state) => {
            return (
              <Step key={state.status}>
                <Flex flexDirection="row" gap="10px">
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
