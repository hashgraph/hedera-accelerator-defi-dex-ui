import { Flex, Text, Box, Input as ChakraInput, InputGroup, InputRightElement } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Tooltip } from "..";
import { Color } from "../..";

export interface InputProps<T extends string> {
  flex?: number | string;
  type: "number" | "text";
  step?: string;
  label: string;
  placeholder?: string;
  tooltipLabel?: string;
  isTooltipVisible?: boolean;
  id: string;
  unit?: string;
  isError?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  value?: string | undefined;
  register?: UseFormRegisterReturn<T>;
}

export function Input<T extends string>(props: InputProps<T>) {
  return (
    <Box flex={props.flex} width="100%">
      <Flex direction="row" gap="1" marginBottom="0.25rem">
        <Text textStyle="p small medium">{props.label}</Text>
        {props.isTooltipVisible && <Tooltip label={props.tooltipLabel ?? ""} />}
      </Flex>
      <InputGroup>
        <ChakraInput
          variant="input-v2"
          type={props.type}
          step={props.step}
          id={props.id}
          value={props.value}
          placeholder={props.placeholder}
          isDisabled={props.isDisabled}
          isReadOnly={props.isReadOnly}
          {...props.register}
          borderColor={props.isError ? Color.Destructive._300 : Color.Neutral._300}
          /** TODO: Move boxShadow style to theme. */
          sx={{
            _focus: {
              boxShadow: props.isError ? `0px 0px 0px 4px ${Color.Destructive._100}` : "none",
            },
          }}
        />
        <InputRightElement
          pointerEvents="none"
          children={<Text textStyle="p small regular">{props.unit}</Text>}
          width="fit-content"
          padding="0 0.75rem"
        />
      </InputGroup>
    </Box>
  );
}
