import { Flex } from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import { useTheme } from "@shared/ui-kit";

interface DAOFormContainerProps extends PropsWithChildren {
  rest?: any;
}

export function DAOFormContainer(props: DAOFormContainerProps) {
  const theme = useTheme();
  return (
    <Flex
      direction="column"
      backgroundColor={theme.bgCard}
      border={`1px solid ${theme.border}`}
      padding="1rem 1.5rem"
      borderRadius="16px"
      width="100%"
      gap="0.75rem"
      backdropFilter="blur(20px)"
      {...props.rest}
    >
      {props.children}
    </Flex>
  );
}
