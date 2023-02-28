import { FormControl, FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import { Input, InputProps } from "./Input";

interface FormInputProps<T extends string> {
  inputProps: InputProps<T>;
  flex?: number | string;
  formHelperText?: string;
  isInvalid?: boolean;
  errorMessage?: string | undefined;
}

export function FormInput<T extends string>(props: FormInputProps<T>) {
  return (
    <FormControl flex={props.flex} isInvalid={props.isInvalid}>
      <Input<T> {...props.inputProps} isError={props.isInvalid} />
      <FormErrorMessage>{props.errorMessage}</FormErrorMessage>
      <FormHelperText textStyle="p small regular">{props.formHelperText}</FormHelperText>
    </FormControl>
  );
}
