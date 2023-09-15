import { FormControl, FormErrorMessage, FormHelperText } from "@chakra-ui/react";
import { TextArea, TextAreaProps } from "./TextArea";
import { ReactElement } from "react";

interface FormInputProps<T extends string> {
  textAreaProps: TextAreaProps<T>;
  flex?: number | string;
  formHelperText?: string | ReactElement;
  isInvalid?: boolean;
  errorMessage?: string | undefined;
}

export function FormTextArea<T extends string>(props: FormInputProps<T>) {
  return (
    <FormControl flex={props.flex} isInvalid={props.isInvalid}>
      <TextArea<T> {...props.textAreaProps} isError={props.isInvalid} />
      <FormErrorMessage>{props.errorMessage}</FormErrorMessage>
      <FormHelperText textStyle="p small regular">{props.formHelperText}</FormHelperText>
    </FormControl>
  );
}
