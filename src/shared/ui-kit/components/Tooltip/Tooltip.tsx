import { Flex, PlacementWithLogical, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import { Color } from "../../themes";
import { TooltipIcon } from "../Icons";

interface TooltipProps {
  label: string;
  fill?: string;
  placement?: PlacementWithLogical;
}

export function Tooltip(props: TooltipProps) {
  const { label, fill, placement = "bottom" } = props;
  return (
    <ChakraTooltip hasArrow label={label} placement={placement} arrowShadowColor={Color.Grey_01} bg={Color.White_02}>
      <Flex alignItems="center">
        <TooltipIcon color={fill} boxSize="4" />
      </Flex>
    </ChakraTooltip>
  );
}
