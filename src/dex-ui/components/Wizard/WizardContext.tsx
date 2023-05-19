import { createContext, useContext } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export interface WizardStep {
  label: string;
  route: string;
  validate?: () => Promise<boolean>;
}
export interface WizardContextProps<FormType> {
  title: string;
  backLabel: string;
  backTo: string;
  stepper: {
    activeStep: number;
    steps: WizardStep[];
    nextStep: () => void;
    prevStep: () => void;
  };
  form: {
    id: string;
    context: unknown;
  } & UseFormReturn<FormType & FieldValues>;
  onSubmit: (data: FormType & FieldValues) => Promise<void>;
}

const WizardContext = createContext<WizardContextProps<any> | null>(null);

export function useWizardContext<FormType>(): WizardContextProps<FormType> {
  const context = useContext<WizardContextProps<FormType> | null>(WizardContext);
  if (context === null) {
    throw new Error("useWizardContext must be used within a WizardProvider");
  }
  return context;
}

export default WizardContext;
