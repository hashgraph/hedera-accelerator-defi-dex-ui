import { Flex, FormControl, FormErrorMessage, FormHelperText, Text } from "@chakra-ui/react";
import { Input, InputProps } from "./Input";
import { Color } from "@dex-ui-components";
import { WarningIcon } from "@chakra-ui/icons";

interface FormInputProps<T extends string> {
  inputProps: InputProps<T>;
  flex?: number | string;
  formHelperText?: string;
  warningHeader?: string;
  warningMessage?: string;
  isInvalid?: boolean;
  errorMessage?: string | undefined;
}

export function FormInput<T extends string>(props: FormInputProps<T>) {
  const { isInvalid, flex, inputProps, errorMessage, formHelperText, warningMessage, warningHeader } = props;
  return (
    <FormControl flex={flex} isInvalid={isInvalid}>
      <Input<T> {...inputProps} isError={isInvalid} />
      <FormErrorMessage>{errorMessage}</FormErrorMessage>
      <FormHelperText textStyle="p small regular">{formHelperText}</FormHelperText>
      {/** TODO: Create Inline Alert Component */}
      {warningMessage && (
        <Flex
          direction="row"
          padding="0.5rem"
          bg={Color.Warning._50}
          borderRadius="0.375rem"
          border={`1px solid ${Color.Warning._300}`}
          gap="2"
        >
          <WarningIcon h={4} w={4} color={Color.Warning._600} marginTop="2px" />
          <Flex direction="column" gap="1">
            <Text textStyle="p small medium">{warningHeader}</Text>
            <Text textStyle="p small regular" color={Color.Neutral._700}>
              {warningMessage}
            </Text>
          </Flex>
        </Flex>
      )}
    </FormControl>
  );
}
