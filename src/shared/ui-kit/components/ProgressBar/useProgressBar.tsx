import { useSteps } from "chakra-ui-steps";
import { ReactNode } from "react";

export function useProgessBar(steps: ReactNode[]) {
  const stepProps = useSteps({
    initialStep: 0,
  });
  const { activeStep, setStep, nextStep, prevStep, reset } = stepProps;

  const isLastStep = activeStep === steps.length - 1;
  const isFirstStep = activeStep === 0;
  const previousStepLabel = isFirstStep ? "Cancel" : `Back`;
  const nextStepLabel = isLastStep ? "Send Token" : `Next`;
  const currentStep = activeStep + 1;
  const totalSteps = steps.length;
  const progressBarValue = (currentStep / totalSteps) * 100;
  const progressBarCaption = `Step ${currentStep} out ${totalSteps}`;

  return {
    nextStep,
    setStep,
    prevStep,
    reset,
    activeStep,
    currentStep,
    totalSteps,
    progressBarValue,
    progressBarCaption,
    steps,
    isLastStep,
    isFirstStep,
    previousStepLabel,
    nextStepLabel,
  };
}
