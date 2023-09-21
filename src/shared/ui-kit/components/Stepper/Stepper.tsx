import { Flex, Stepper as ChakraStepper, Step, Divider } from "@chakra-ui/react";
import { ProposalStateIcon, ProposalState } from "./types";
import { Color } from "../../themes";
import { ActiveStepIcon, CancelledStepIcon, DisabledStepIcon, CompletedStepIcon } from "../Icons";
import { Text } from "../Text";

const GetStatusIcon = (iconType: string) => {
  switch (iconType) {
    case ProposalStateIcon.Active:
      return <ActiveStepIcon color={Color.Blue._500} boxSize="7" />;
    case ProposalStateIcon.Completed:
      return <CompletedStepIcon />;
    case ProposalStateIcon.Disabled:
      return <DisabledStepIcon />;
    case ProposalStateIcon.Cancelled:
      return <CancelledStepIcon color={Color.Black_01} fillOpacity="0.54" boxSize="7" />;
    default:
      break;
  }
};

interface StepperProps {
  states: ProposalState[];
}

/** DEPRECATED */
export function Stepper(props: StepperProps) {
  const { states } = props;
  const isLastStep = states.length - 1;
  return (
    <ChakraStepper index={0} orientation="vertical" gap="0" padding="1.5rem 1rem">
      {states.map((step, index) => (
        <Step key={step.status}>
          <Flex direction="column" gap="1">
            <Flex flexDirection="row" gap="3">
              {GetStatusIcon(step.iconType)}
              <Flex flexDirection="row" gap="0.3rem" alignItems="center">
                <Text.P_Medium_Regular
                  color={step.iconType === ProposalStateIcon.Disabled ? Color.Grey_Blue._200 : Color.Neutral._900}
                >
                  {step.status}
                </Text.P_Medium_Regular>
                {step.timeRemaining && (
                  <Text.P_Small_Regular color={Color.Grey_Blue._500}>{` - ${step.timeRemaining}`}</Text.P_Small_Regular>
                )}
              </Flex>
            </Flex>
            {index !== isLastStep ? (
              <Divider
                orientation="vertical"
                borderStyle="dashed"
                height="5"
                marginLeft="0.7rem"
                marginBottom="1"
                borderLeftWidth="0.2rem"
                borderColor={Color.Grey_01}
                width="0"
              />
            ) : undefined}
          </Flex>
        </Step>
      ))}
    </ChakraStepper>
  );
}
