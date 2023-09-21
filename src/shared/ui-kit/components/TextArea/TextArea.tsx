import { Flex, Box, Textarea as ChakraTextArea, PlacementWithLogical } from "@chakra-ui/react";
import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Tooltip } from "..";
import { Color } from "../..";
import { Text } from "../Text";

export interface TextAreaProps<T extends string> {
  flex?: number | string;
  label: string | React.ReactElement;
  placeholder?: string;
  tooltipLabel?: string;
  isTooltipVisible?: boolean;
  toolTipLabelPlacement?: PlacementWithLogical;
  id: string;
  height?: string;
  minHeight?: string;
  isError?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  value?: string | undefined;
  resize?: "horizontal" | "vertical" | "none";
  register?: UseFormRegisterReturn<T>;
}

export function TextArea<T extends string>(props: TextAreaProps<T>) {
  const {
    flex,
    label,
    isTooltipVisible,
    tooltipLabel,
    id,
    height,
    minHeight,
    value,
    placeholder,
    isDisabled,
    isError,
    isReadOnly,
    toolTipLabelPlacement,
    resize = "vertical",
    register,
  } = props;
  return (
    <Box flex={flex} width="100%">
      <Flex direction="row" gap="1" marginBottom="0.25rem">
        {React.isValidElement(label) ? label : <Text.P_Small_Medium>{label}</Text.P_Small_Medium>}
        {isTooltipVisible && <Tooltip label={tooltipLabel ?? ""} placement={toolTipLabelPlacement} />}
      </Flex>
      <ChakraTextArea
        id={id}
        variant="input-text-area"
        resize={resize}
        value={value}
        height={height}
        minHeight={minHeight}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isReadOnly={isReadOnly}
        borderColor={isError ? Color.Destructive._300 : Color.Neutral._300}
        {...register}
        /** TODO: Move boxShadow style to theme. */
        sx={{
          _focus: {
            boxShadow: isError ? `0px 0px 0px 4px ${Color.Destructive._100}` : "none",
          },
        }}
      />
    </Box>
  );
}
