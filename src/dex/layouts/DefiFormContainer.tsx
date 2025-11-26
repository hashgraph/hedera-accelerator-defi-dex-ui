import { Box, Center, Flex, useBreakpointValue } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

type DefiFormContainerProps = PropsWithChildren;

export function DefiFormContainer(props: DefiFormContainerProps) {
  const margin = useBreakpointValue({
    base: "1rem auto",
    md: "2rem auto",
  });

  const maxWidth = useBreakpointValue({
    base: "100%",
    sm: "400px",
    md: "410px",
  });

  const padding = useBreakpointValue({
    base: "0 1rem",
    sm: "0",
  });

  return (
    <Box margin={margin} px={padding}>
      <Center>
        <Flex flexDirection="column" alignItems="center" gap="1rem" maxWidth={maxWidth} width="100%">
          {props.children}
        </Flex>
      </Center>
    </Box>
  );
}
