import { ChangeEvent, cloneElement } from "react";
import { Select } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { ArrowDropDownIcon } from "..";

interface DropdownDataType {
  label: string;
  value: number;
}
interface DropdownSelectProps {
  value?: number | undefined;
  data: DropdownDataType[] | undefined;
  selectControls?: UseFormRegisterReturn<any>;
  onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const DropdownSelector = (props: DropdownSelectProps) => {
  const { value, onChangeHandler, data } = props;

  return cloneElement(
    <Select variant="dropDownSelector" value={value} icon={<ArrowDropDownIcon />} {...props.selectControls}>
      {data
        ? data.map((input: DropdownDataType) => {
            return (
              <option key={input.value} value={input.value}>
                {input.label}
              </option>
            );
          })
        : undefined}
    </Select>,
    onChangeHandler ? { onChange: onChangeHandler } : {}
  );
};

export { DropdownSelector };
