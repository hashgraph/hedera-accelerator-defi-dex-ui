import React from "react";
import { NumberInput, NumberInputProps, NumberInputField } from "@chakra-ui/react";

interface TokenAmountInputProps extends NumberInputProps {
  dataTestId?: string;
}

const TokenAmountInput = ({
  dataTestId,
  value,
  defaultValue = 0.0,
  precision = 2,
  ...restProps
}: TokenAmountInputProps) => {
  return (
    <NumberInput
      data-testid={`${dataTestId}`}
      value={value}
      defaultValue={defaultValue}
      precision={precision}
      {...restProps}
    >
      <NumberInputField data-testid={`${dataTestId}-field`} />
    </NumberInput>
  );
};

export { TokenAmountInput };
