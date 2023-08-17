import { createContext, useContext } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

export interface WizardStepProps {
  label: string;
  /**
   * The last path in the 'route' URL must match the 'label' field for the
   * stepper work as intended. Letter casing does not impact the matching logic
   * between the 'label' and last path since .toLowerCase() is used. */
  route: string;
  isLoading?: boolean;
  isError?: boolean;
  validate?: () => Promise<boolean>;
}
export interface WizardContextProps<FormType> {
  title: string;
  backLabel: string;
  backTo: string;
  stepper: {
    activeStep: number;
    steps: WizardStepProps[];
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
