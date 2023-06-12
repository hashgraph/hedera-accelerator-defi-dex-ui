import { Spinner } from "@chakra-ui/react";
import { Step as ChakraStep, Steps as ChakraSteps } from "chakra-ui-steps";
import { Color } from "../../themes";
import { ActiveStepIcon, CancelledStepIcon, CompletedStepIcon, DisabledStepIcon } from "../Icons";

function RedCancelledStepIcon() {
  return <CancelledStepIcon fill={Color.Destructive._500} boxSize="8" />;
}

function PrimarySpinner() {
  return <Spinner color={Color.Blue._500} borderWidth="3px" />;
}

interface GetStepIconParams {
  isActive: boolean;
  isLoading: boolean;
  isError: boolean;
}

function getStepIcon(params: GetStepIconParams) {
  const { isLoading, isError, isActive } = params;
  if (isLoading) return PrimarySpinner;
  if (isError) return RedCancelledStepIcon;
  if (isActive) return ActiveStepIcon;
  return DisabledStepIcon;
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
  return (
    <ChakraSteps
      activeStep={activeStep}
      trackColor={Color.Blue._500}
      colorScheme={Color.Blue._500}
      checkIcon={CompletedStepIcon}
    >
      {steps.map(({ label, isLoading, isError }, index) => {
        const isActive = index === activeStep;
        const icon = getStepIcon({
          isActive,
          isLoading: Boolean(isLoading),
          isError: Boolean(isError),
        });
        return <ChakraStep label={label} key={label} icon={icon} />;
      })}
    </ChakraSteps>
  );
}
