import { ChangeEvent, cloneElement } from "react";
import { Select, Skeleton } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";
import { ArrowDropDownIcon } from "..";

interface DropdownDataType {
  label: string;
  value: number;
}
interface DropdownSelectProps {
  value?: number | undefined;
  isLoading?: boolean | undefined;
  data: DropdownDataType[] | undefined;
  selectControls?: UseFormRegisterReturn<any>;
  onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const DropdownSelector = (props: DropdownSelectProps) => {
  const { value, onChangeHandler, data, selectControls, isLoading = false } = props;

  return cloneElement(
    <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
      <Select variant="dropDownSelector" value={value} icon={<ArrowDropDownIcon />} {...selectControls}>
        {data?.map((input: DropdownDataType) => {
          return (
            <option key={input.value} value={input.value}>
              {input.label}
            </option>
          );
        })}
      </Select>
    </Skeleton>,
    onChangeHandler ? { onChange: onChangeHandler } : {}
  );
};

export { DropdownSelector };
