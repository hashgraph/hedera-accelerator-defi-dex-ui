import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import WizardContext, { WizardStepProps } from "./WizardContext";
import { WizardHeader } from "./WizardHeader";
import { WizardFooter } from "./WizardFooter";
import { WizardStepper } from "./WizardStepper";
import { WizardForm } from "./WizardForm";
import { useLocation } from "react-router-dom";
import { getLastPathInRoute } from "@dex/utils";
import { getCurrentStepIndexByRoute } from "./utils";
import { useSteps } from "chakra-ui-steps";
import { FieldValues, UseFormReturn } from "react-hook-form";

interface WizardProps<FormType> {
  context: {
    title: string;
    backLabel: string;
    backTo: string;
    stepper: {
      steps: WizardStepProps[];
    };
    form: {
      id: string;
      context: unknown;
    } & UseFormReturn<FormType & FieldValues>;
    onSubmit: (data: FormType & FieldValues) => Promise<void>;
  };
  header: ReactNode;
  stepper: ReactNode;
  form: ReactNode;
  footer: ReactNode;
}

function Wizard<FormType>(props: WizardProps<FormType>) {
  const { context, header, stepper, form, footer } = props;
  const location = useLocation();
  const lastPath = getLastPathInRoute(location.pathname);
  const intialStep = getCurrentStepIndexByRoute(context.stepper.steps, lastPath);
  const stepProps = useSteps({
    initialStep: intialStep > 0 ? intialStep : 0,
  });
  const { activeStep, nextStep, prevStep } = stepProps;

  const wizardContextValue = {
    ...context,
    stepper: { steps: context.stepper.steps, activeStep, nextStep, prevStep },
  };

  return (
    <WizardContext.Provider value={wizardContextValue}>
      <Flex layerStyle="wizard__container">
        {header}
        {stepper}
        {form}
        {footer}
      </Flex>
    </WizardContext.Provider>
  );
}

Wizard.Header = WizardHeader;
Wizard.Stepper = WizardStepper;
Wizard.Form = WizardForm;
Wizard.Footer = WizardFooter;

export { Wizard };
