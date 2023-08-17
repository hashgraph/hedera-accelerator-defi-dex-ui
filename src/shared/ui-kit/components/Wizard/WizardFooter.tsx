import { Button, Flex, Spacer } from "@chakra-ui/react";
import { useWizardContext } from "./WizardContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "../Icons";

export function WizardFooter() {
  const navigate = useNavigate();
  const { stepper, backTo, form } = useWizardContext();
  const { steps, activeStep, nextStep, prevStep } = stepper;
  const { id, formState } = form;
  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;

  async function validateStep(activeStep: number): Promise<boolean> {
    const triggerDefaultValidations = (): Promise<boolean> => Promise.resolve(true);
    const validateFn = steps.at(activeStep)?.validate;
    return validateFn ? validateFn() : triggerDefaultValidations();
  }

  async function handleNextClicked() {
    const isStepDataValid = await validateStep(activeStep);
    if (isStepDataValid) {
      nextStep();
      const nextStepRoute = steps.at(activeStep + 1)?.route ?? "";
      navigate(nextStepRoute);
    }
  }

  function handleCancelClicked() {
    navigate(backTo);
  }

  function handlePreviousClicked() {
    prevStep();
    const prevStepRoute = steps.at(activeStep - 1)?.route ?? "";
    navigate(prevStepRoute);
  }

  const LeftFooterAction = isFirstStep ? (
    <Button key="cancel" variant="secondary" onClick={handleCancelClicked}>
      Cancel
    </Button>
  ) : (
    <Button
      type="button"
      key="back"
      variant="secondary"
      onClick={handlePreviousClicked}
      leftIcon={<ChevronLeftIcon w="2.5" h="2.5" />}
    >
      Back
    </Button>
  );

  const RightFooterAction = isLastStep ? (
    <Button key="submit" type="submit" form={id} isDisabled={formState?.isSubmitting}>
      Submit
    </Button>
  ) : (
    <Button type="button" key="next" onClick={handleNextClicked} rightIcon={<ChevronRightIcon w="2.5" h="2.5" />}>
      Next
    </Button>
  );

  return (
    <Flex layerStyle="wizard__footer">
      {LeftFooterAction}
      <Spacer />
      {RightFooterAction}
    </Flex>
  );
}
