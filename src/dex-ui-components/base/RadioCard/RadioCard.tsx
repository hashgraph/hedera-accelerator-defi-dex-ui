import { Box, useRadio } from "@chakra-ui/react";
import { Color } from "../../themes";

export function RadioCard(props: any) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        bg={Color.Grey_Blue._50}
        height="100%"
        cursor="pointer"
        borderWidth="1px"
        borderRadius="4px"
        _checked={{
          bg: Color.Grey_Blue._600,
          color: Color.White,
        }}
        _hover={{
          bg: Color.Grey_Blue._200,
        }}
        _focus={{
          bg: Color.Grey_Blue._600,
          color: Color.White,
        }}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  );
}
