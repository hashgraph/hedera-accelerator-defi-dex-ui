import { ChangeEvent, cloneElement } from "react";
import { Select } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { ArrowDropDownIcon } from "../";

interface InputDataType {
  label: string;
  value: number;
}
interface InputSelectProps {
  value?: number | undefined;
  data: InputDataType[] | undefined;
  selectControls?: UseFormRegisterReturn<any>;
  onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const InputSelector = (props: InputSelectProps) => {
  const { value, onChangeHandler, data } = props;

  return cloneElement(
    <Select variant="inputSelector" value={value} icon={<ArrowDropDownIcon />} {...props.selectControls}>
      {data
        ? data.map((input: InputDataType) => {
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

export { InputSelector };
