import { Collapse, Flex } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

interface DefiFormSettingsLayoutProps extends PropsWithChildren {
  isSettingsOpen: boolean;
}

export function DefiFormSettingsLayout(props: DefiFormSettingsLayoutProps) {
  return (
    <Collapse in={props.isSettingsOpen} animateOpacity>
      <Flex direction="row" gap="5">
        {props.children}
      </Flex>
    </Collapse>
  );
}
