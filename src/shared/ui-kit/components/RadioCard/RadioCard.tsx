import { Box, useRadio } from "@chakra-ui/react";
import { useTheme } from "../../themes";

export function RadioCard(props: any) {
  const theme = useTheme();
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        bg={theme.bgSecondary}
        color={theme.text}
        height="100%"
        cursor="pointer"
        borderWidth="1px"
        borderColor={theme.border}
        borderRadius="12px"
        transition="all 0.2s ease-in-out"
        _checked={{
          bg: theme.accentMuted,
          borderColor: theme.accent,
          color: theme.text,
        }}
        _hover={{
          bg: theme.bgCardHover,
          borderColor: theme.borderHover,
        }}
        _focus={{
          bg: theme.accentMuted,
          borderColor: theme.accent,
          color: theme.text,
        }}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  );
}
