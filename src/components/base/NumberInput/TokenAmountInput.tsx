import React, { ChangeEvent } from "react";
import { NumberInput, NumberInputProps, NumberInputField } from "@chakra-ui/react";

interface TokenAmountInputProps extends NumberInputProps {
  dataTestId?: string;
  onChangeHandler: (event: ChangeEvent<HTMLInputElement>) => void;
}

const TokenAmountInput = ({
  dataTestId,
  value,
  defaultValue = 0.0,
  precision = 2,
  onChangeHandler,
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
      <NumberInputField data-testid={`${dataTestId}-field`} onChange={onChangeHandler} />
    </NumberInput>
  );
};

export { TokenAmountInput };
