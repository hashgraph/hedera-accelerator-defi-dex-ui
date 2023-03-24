import { Spinner } from "@chakra-ui/react";
import { Step, Steps } from "chakra-ui-steps";
import { ReactElement } from "react";
import { Color } from "../../themes";
import { ActiveStepIcon, CancelledStepIcon, CompletedStepIcon, DisabledStepIcon } from "../Icons";

interface StepData {
  label: string;
  content: ReactElement;
  isLoading?: boolean;
  isError?: boolean;
}

interface StepperV2Props {
  steps: StepData[];
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  activeStep: number;
}

function RedCancelledStepIcon() {
  return <CancelledStepIcon fill={Color.Destructive._500} />;
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
  if (isLoading) {
    return PrimarySpinner;
  }
  if (isError) {
    return RedCancelledStepIcon;
  }
  if (isActive) {
    return ActiveStepIcon;
  }
  return DisabledStepIcon;
}

export function StepperV2(props: StepperV2Props) {
  const { steps, activeStep } = props;
  return (
    <Steps
      activeStep={activeStep}
      trackColor={Color.Blue._500}
      colorScheme={Color.Blue._500}
      checkIcon={CompletedStepIcon}
    >
      {steps.map(({ label, content, isLoading, isError }, index) => {
        const isActive = index === activeStep;
        const icon = getStepIcon({
          isActive,
          isLoading: Boolean(isLoading),
          isError: Boolean(isError),
        });
        return (
          <Step label={label} key={label} icon={icon}>
            {content}
          </Step>
        );
      })}
    </Steps>
  );
}
