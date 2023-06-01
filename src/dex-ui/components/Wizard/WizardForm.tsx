import { Flex } from "@chakra-ui/react";
import { FormProvider } from "react-hook-form";
import { Outlet } from "react-router-dom";
import { useWizardContext } from "./WizardContext";

interface WizardFormProps {
  layerStyle?: string;
}

export function WizardForm(props: WizardFormProps) {
  const { form, onSubmit } = useWizardContext();
  const { layerStyle = "wizard__form" } = props;
  const { id, context, handleSubmit } = form;
  return (
    <FormProvider {...form}>
      <Flex layerStyle={layerStyle}>
        <form style={{ width: "100%" }} id={id} onSubmit={handleSubmit(onSubmit)}>
          <Outlet context={context} />
        </form>
      </Flex>
    </FormProvider>
  );
}
