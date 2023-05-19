import { WizardStep } from "./WizardContext";

export function getCurrentStepIndexByRoute(steps: WizardStep[], path: string) {
  return steps.findIndex((step) => step.label.toLowerCase() === path.toLowerCase());
}
