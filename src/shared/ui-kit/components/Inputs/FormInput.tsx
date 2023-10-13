import { Box, FormControl, FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import { Input, InputProps } from "./Input";
import { ReactNode } from "react";
import { InlineAlert, InlineAlertType } from "../InlineAlert";

export interface FormInputProps<T extends string> {
  inputProps: InputProps<T>;
  flex?: number | string;
  formHelperText?: string;
  warningHeader?: string;
  warningMessage?: string;
  isInvalid?: boolean;
  errorMessage?: string | undefined;
  actionButton?: ReactNode;
}

export function FormInput<T extends string>(props: FormInputProps<T>) {
  const { isInvalid, flex, inputProps, errorMessage, formHelperText, warningMessage, warningHeader, actionButton } =
    props;
  return (
    <FormControl flex={flex} isInvalid={isInvalid}>
      <Input<T> {...inputProps} isError={isInvalid} />
      <FormErrorMessage>{errorMessage}</FormErrorMessage>
      <Box padding="0 0.25rem">{actionButton}</Box>
      <FormHelperText textStyle="p small regular">{formHelperText}</FormHelperText>
      {warningMessage && <InlineAlert title={warningHeader} message={warningMessage} type={InlineAlertType.Warning} />}
    </FormControl>
  );
}
