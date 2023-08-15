import { Box, Center, Flex } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

type DefiFormContainerProps = PropsWithChildren;

export function DefiFormContainer(props: DefiFormContainerProps) {
  return (
    <Box margin="2rem auto">
      <Center>
        <Flex flexDirection="column" alignItems="center" gap="1rem" maxWidth="410px">
          {props.children}
        </Flex>
      </Center>
    </Box>
  );
}
