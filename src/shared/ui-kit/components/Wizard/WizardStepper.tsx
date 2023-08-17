import { Steps, StepProps } from "../Stepper";
import { WizardStepProps, useWizardContext } from "./WizardContext";
import { Flex } from "@chakra-ui/react";

export function WizardStepper() {
  const { stepper } = useWizardContext();
  const { activeStep, steps: wizardSteps } = stepper;

  const steps: StepProps[] = wizardSteps.map((step: WizardStepProps) => {
    const { label, isLoading, isError } = step;
    return { label, isLoading, isError };
  });

  return (
    <Flex width={steps.length === 2 ? "50%" : "100%"}>
      <Steps activeStep={activeStep} steps={steps} />
    </Flex>
  );
}
