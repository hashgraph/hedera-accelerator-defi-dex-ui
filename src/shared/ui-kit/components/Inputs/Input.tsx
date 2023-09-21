import {
  Text as ChakraText,
  Flex,
  Box,
  PlacementWithLogical,
  Input as ChakraInput,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import React, { useLayoutEffect, useRef, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Tooltip } from "..";
import { Color } from "../../themes";
import { Text } from "../Text";

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

  const RightElements = React.isValidElement(unit) ? (
    unit
  ) : (
    <Text.P_Small_Regular padding="0 1rem">{unit}</Text.P_Small_Regular>
  );
  const [rightElementWidth, setRightElementWidth] = useState(0);
  const rightElementRef = useRef(null);

  useLayoutEffect(() => {
    if (rightElementRef.current !== null) {
      setRightElementWidth((rightElementRef.current as HTMLElement).offsetWidth);
    }
  }, [unit]);

  return (
    <Box flex={flex} width="100%">
      <Flex direction="row" gap="1" marginBottom="0.25rem">
        {React.isValidElement(label) ? (
          label
        ) : (
          <ChakraText
            textStyle={isReadOnly ? "p xsmall medium" : "p small medium"}
            color={isReadOnly ? Color.Neutral._500 : Color.Neutral._900}
          >
            {label}
          </ChakraText>
        )}
        {isTooltipVisible && <Tooltip label={tooltipLabel ?? ""} placement={toolTipLabelPlacement} />}
      </Flex>
      {isReadOnly ? (
        <Flex gap="0.2rem">
          <Text.P_Small_Regular color={Color.Neutral._900}>{value}</Text.P_Small_Regular>
          {React.isValidElement(unit) ? unit : <Text.P_Small_Regular>{unit}</Text.P_Small_Regular>}
        </Flex>
      ) : (
        <InputGroup>
          <ChakraInput
            variant="input-v2"
            paddingRight={unit ? `${rightElementWidth}px` : "1rem"}
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
          {unit ? (
            <InputRightElement
              ref={rightElementRef}
              pointerEvents={pointerEvents ? pointerEvents : "none"}
              children={RightElements}
              width="fit-content"
              padding="0"
            />
          ) : (
            <></>
          )}
        </InputGroup>
      )}
    </Box>
  );
}
