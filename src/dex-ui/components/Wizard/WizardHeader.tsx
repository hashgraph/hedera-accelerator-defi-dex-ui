import { Text, Flex } from "@chakra-ui/react";
import { useWizardContext } from "./WizardContext";
import { Breadcrumb } from "@dex-ui-components";
import { Link as ReachLink } from "react-router-dom";

export function WizardHeader() {
  const { title, backLabel, backTo } = useWizardContext();
  return (
    <Flex layerStyle="wizard__header">
      <Text textStyle="h4 medium">{title}</Text>
      <Breadcrumb to={backTo} as={ReachLink} label={backLabel} />
    </Flex>
  );
}
