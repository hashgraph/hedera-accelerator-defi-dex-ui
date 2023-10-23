import { FormControl, Select, FormErrorMessage } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Text } from "../Text";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface FormDropdownProps {
  label: string;
  placeholder: string;
  data: DropdownOption[];
  selectedOptions?: Set<string | number>;
  isDisabled?: boolean;
  isInvalid?: boolean;
  errorMessage?: string | undefined;
  register?: UseFormRegisterReturn;
}

export function FormDropdown(props: FormDropdownProps) {
  const { label, placeholder, data, selectedOptions, isDisabled, isInvalid, errorMessage, register } = props;

  return (
    <FormControl isInvalid={isInvalid} isDisabled={isDisabled}>
      <Text.P_Small_Medium marginBottom="0.25rem">{label}</Text.P_Small_Medium>
      <Select variant="formTokenSelector" placeholder={placeholder} {...register}>
        {data.map((option: DropdownOption) => {
          return (
            <option key={option.value} value={option.value} disabled={selectedOptions?.has(option.value)}>
              {option.label}
            </option>
          );
        })}
      </Select>
      <FormErrorMessage>{errorMessage}</FormErrorMessage>
    </FormControl>
  );
}
