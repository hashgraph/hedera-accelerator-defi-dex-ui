import {
  Flex,
  Text,
  Box,
  PlacementWithLogical,
  Input as ChakraInput,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Tooltip } from "..";
import { Color } from "../..";

export interface InputProps<T extends string> {
  flex?: number | string;
  pointerEvents?: "all" | "none";
  type: "number" | "text";
  step?: string;
  label: string | React.ReactElement;
  placeholder?: string;
  tooltipLabel?: string;
  isTooltipVisible?: boolean;
  toolTipLabelPlacement?: PlacementWithLogical;
  id: string;
  unit?: string | React.ReactElement;
  isError?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  value?: string | undefined;
  register?: UseFormRegisterReturn<T>;
}

export function Input<T extends string>(props: InputProps<T>) {
  const {
    flex,
    label,
    isTooltipVisible,
    tooltipLabel,
    toolTipLabelPlacement,
    type,
    step,
    id,
    value,
    placeholder,
    isDisabled,
    isError,
    isReadOnly,
    unit,
    pointerEvents,
    register,
  } = props;
  return (
    <Box flex={flex} width="100%">
      <Flex direction="row" gap="1" marginBottom="0.25rem">
        {React.isValidElement(label) ? (
          label
        ) : (
          <Text
            textStyle={isReadOnly ? "p xsmall medium" : "p small medium"}
            color={isReadOnly ? Color.Neutral._500 : Color.Neutral._900}
          >
            {label}
          </Text>
        )}
        {isTooltipVisible && <Tooltip label={tooltipLabel ?? ""} placement={toolTipLabelPlacement} />}
      </Flex>
      {isReadOnly ? (
        <Text textStyle="p small regular" color={Color.Neutral._900}>
          {value}
        </Text>
      ) : (
        <InputGroup>
          <ChakraInput
            variant="input-v2"
            type={type}
            step={step}
            id={id}
            value={value}
            placeholder={placeholder}
            isDisabled={isDisabled}
            isReadOnly={isReadOnly}
            {...register}
            borderColor={isError ? Color.Destructive._300 : Color.Neutral._300}
            /** TODO: Move boxShadow style to theme. */
            sx={{
              _focus: {
                boxShadow: isError ? `0px 0px 0px 4px ${Color.Destructive._100}` : "none",
              },
            }}
          />
          <InputRightElement
            pointerEvents={pointerEvents ? pointerEvents : "none"}
            children={React.isValidElement(unit) ? unit : <Text textStyle="p small regular">{unit}</Text>}
            width="fit-content"
            padding="0 0.75rem"
          />
        </InputGroup>
      )}
    </Box>
  );
}
