import { Flex } from "@chakra-ui/react";
import { useWizardContext } from "./WizardContext";
import { Breadcrumb } from "../Breadcrumb";
import { Text } from "../Text";

export function WizardHeader() {
  const { title, backLabel, backTo } = useWizardContext();
  return (
    <Flex layerStyle="wizard__header">
      <Text.H4_Medium>{title}</Text.H4_Medium>
      <Breadcrumb to={backTo} label={backLabel} />
    </Flex>
  );
}
