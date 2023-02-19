import { Flex, Text, Box, Input as ChakraInput, InputGroup, InputRightElement } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Tooltip } from "..";
import { Color } from "../..";

interface InputProps<T extends string> {
  type: "number" | "text";
  step?: string;
  label: string;
  tooltipLabel: string;
  isTooltipVisible?: boolean;
  id: string;
  unit: string;
  isError?: boolean;
  value?: string | undefined;
  register: UseFormRegisterReturn<T>;
}

export function Input<T extends string>(props: InputProps<T>) {
  return (
    <Box>
      <Flex direction="row" gap="1" marginBottom="0.25rem">
        <Text textStyle="h4">{props.label}</Text>
        {props.isTooltipVisible && <Tooltip label={props.tooltipLabel} />}
      </Flex>
      <InputGroup>
        <ChakraInput
          variant="settings"
          type={props.type}
          step={props.step}
          id={props.id}
          value={props.value}
          {...props.register}
          borderColor={props.isError ? Color.Red_01 : Color.Black_01}
        />
        <InputRightElement pointerEvents="none" children={props.unit} />
      </InputGroup>
    </Box>
  );
}
