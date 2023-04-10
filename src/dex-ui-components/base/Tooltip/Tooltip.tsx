import { Flex, PlacementWithLogical, Tooltip as ChakraTooltip } from "@chakra-ui/react";
import { Color } from "../../themes";
import { TooltipIcon } from "../Icons";

interface TooltipProps {
  label: string;
  placement?: PlacementWithLogical;
  fill?: string;
}

export function Tooltip(props: TooltipProps) {
  return (
    <ChakraTooltip
      hasArrow
      label={props.label}
      placement={props.placement ? props.placement : "bottom"}
      arrowShadowColor={Color.Grey_01}
      bg={Color.White_02}
    >
      <Flex alignItems="center">
        <TooltipIcon fill={props.fill} />
      </Flex>
    </ChakraTooltip>
  );
}
