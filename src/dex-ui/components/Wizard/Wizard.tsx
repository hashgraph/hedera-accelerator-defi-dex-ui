import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";
import WizardContext, { WizardContextProps } from "./WizardContext";
import { WizardHeader } from "./WizardHeader";
import { WizardFooter } from "./WizardFooter";
import { WizardStepper } from "./WizardStepper";
import { WizardForm } from "./WizardForm";

interface WizardProps<FormType> {
  context: WizardContextProps<FormType>;
  header: ReactNode;
  stepper: ReactNode;
  form: ReactNode;
  footer: ReactNode;
}

function Wizard<FormType>(props: WizardProps<FormType>) {
  const { context, header, stepper, form, footer } = props;

  return (
    <WizardContext.Provider value={context}>
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
