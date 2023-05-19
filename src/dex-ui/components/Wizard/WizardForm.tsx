import { Flex } from "@chakra-ui/react";
import { FormProvider } from "react-hook-form";
import { Outlet } from "react-router-dom";
import { useWizardContext } from "./WizardContext";

export function WizardForm() {
  const { form, onSubmit } = useWizardContext();
  const { id, context, handleSubmit } = form;
  return (
    <FormProvider {...form}>
      <Flex layerStyle="wizard__form">
        <form style={{ width: "100%" }} id={id} onSubmit={handleSubmit(onSubmit)}>
          <Outlet context={context} />
        </form>
      </Flex>
    </FormProvider>
  );
}
