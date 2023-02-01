import { Flex, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import { Color } from "../../themes";
import { TooltipIcon } from "../Icons";

interface TooltipProps {
  label: string;
}

export function Tooltip(props: TooltipProps) {
  return (
    <ChakraTooltip hasArrow label={props.label} placement="bottom" arrowShadowColor={Color.Grey_01} bg={Color.White_02}>
      <Flex alignItems="center">
        <TooltipIcon />
      </Flex>
    </ChakraTooltip>
  );
}
