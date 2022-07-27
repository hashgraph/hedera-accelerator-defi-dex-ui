import React from "react";
import { Box, Button, Center, ButtonProps } from "@chakra-ui/react";
import { UpDownIcon } from "@chakra-ui/icons";

const SwapTokenInputsButton = (props: ButtonProps) => {
  return (
    <Box bg="rgb(36, 38, 76)" borderRadius="24px" width="24px" margin="0.5rem" padding="0.5rem" alignItems="center">
      <Center>
        <Button {...props}>
          <UpDownIcon w={4} h={4} />
        </Button>
      </Center>
    </Box>
  );
};

export { SwapTokenInputsButton };
