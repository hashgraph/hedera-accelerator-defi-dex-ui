import { Flex, Stepper, Spinner, Box, Step, StepIndicator, StepTitle, StepStatus, Progress } from "@chakra-ui/react";
import { Color } from "../../themes";
import { ActiveStepIcon, CancelledStepIcon, CompletedStepIcon, DisabledStepIcon } from "../Icons";

interface GetStepIconParams {
  isLoading: boolean;
  isError: boolean;
}

function getStepIcon(params: GetStepIconParams) {
  const { isLoading, isError } = params;
  if (isLoading) return <Spinner color={Color.Blue._500} borderWidth="3px" boxSize="6" />;
  if (isError) return <CancelledStepIcon position="relative" top="1px" left="1px" boxSize="6" />;
  return (
    <StepStatus
      complete={<CompletedStepIcon boxSize="6" />}
      incomplete={<DisabledStepIcon boxSize="6" />}
      active={<ActiveStepIcon boxSize="6" />}
    />
  );
}

export interface StepProps {
  label: string;
  isLoading?: boolean;
  isError?: boolean;
}

interface StepsProps {
  activeStep: number;
  steps: StepProps[];
}

export function Steps(props: StepsProps) {
  const { steps, activeStep } = props;
  const max = steps.length - 1;
  const progressPercent = (activeStep / max) * 100;

  return (
    <Flex position="relative" width="100%" justifyContent="center">
      <Stepper index={activeStep} gap="0" zIndex="100" width="100%">
        {steps.map(({ label, isLoading, isError }, index) => {
          const icon = getStepIcon({
            isLoading: Boolean(isLoading),
            isError: Boolean(isError),
          });
          return (
            <Step key={index}>
              <Flex direction="column" alignItems="center" gap="1">
                <StepIndicator>{icon}</StepIndicator>
                <Box flexShrink="0">
                  <StepTitle>{label}</StepTitle>
                </Box>
              </Flex>
            </Step>
          );
        })}
      </Stepper>
      <Progress value={progressPercent} position="absolute" height="4px" width="90%" top="10px" zIndex="0" />
    </Flex>
  );
}
