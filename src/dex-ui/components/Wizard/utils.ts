import { WizardStepProps } from "./WizardContext";

export function getCurrentStepIndexByRoute(steps: WizardStepProps[], path: string) {
  return steps.findIndex((step) => step.label.toLowerCase() === path.toLowerCase());
}
