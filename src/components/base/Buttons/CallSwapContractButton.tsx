import React from "react";
import { Button, ButtonProps } from "@chakra-ui/react";

const CallSwapContractButton = ({ ...restProps }: ButtonProps) => {
  return (
    <Button onClick={() => console.log("swap")} {...restProps}>
      Swap
    </Button>
  );
};

export { CallSwapContractButton };
