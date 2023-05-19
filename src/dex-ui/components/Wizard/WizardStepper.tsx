import { StepData, StepperV2 } from "@dex-ui-components";
import { useWizardContext } from "./WizardContext";
import { Flex } from "@chakra-ui/react";

export function WizardStepper() {
  const { stepper } = useWizardContext();
  const { activeStep, steps } = stepper;
  return (
    <Flex width={steps.length === 2 ? "50%" : "100%"}>
      {/** Using temporary type casting for 'steps' props until the Stepper component is refactored. */}
      <StepperV2 activeStep={activeStep} steps={steps as StepData[]} />
    </Flex>
  );
}
