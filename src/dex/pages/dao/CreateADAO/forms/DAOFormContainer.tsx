import { Flex } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { Color } from "@shared/ui-kit";

interface DAOFormContainerProps extends PropsWithChildren {
  rest?: any;
}

export function DAOFormContainer(props: DAOFormContainerProps) {
  return (
    <Flex
      direction="column"
      backgroundColor={Color.White}
      border={`1px solid ${Color.Neutral._200}`}
      padding="1rem 1.5rem"
      borderRadius="4px"
      width="100%"
      gap="0.75rem"
      {...props.rest}
    >
      {props.children}
    </Flex>
  );
}
