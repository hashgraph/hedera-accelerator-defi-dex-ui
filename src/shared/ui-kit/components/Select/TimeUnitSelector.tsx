import { ChangeEvent, cloneElement } from "react";
import { Select } from "@chakra-ui/react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TimeUnitSelectorProps {
  /* The unique Account ID of the token */
  value?: string | undefined;
  selectControls?: UseFormRegisterReturn<any>;
  onChangeHandler?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const timeUnits = [
  {
    label: "Seconds",
    value: 1,
  },
  {
    label: "Minutes",
    value: 60,
  },
  {
    label: "Hours",
    value: 3600,
  },
  {
    label: "Days",
    value: 86400,
  },
];

const TimeUnitSelector = (props: TimeUnitSelectorProps) => {
  const { onChangeHandler, selectControls } = props;
  return cloneElement(
    <Select variant="formTokenSelector" {...selectControls} width="7rem" defaultValue={1}>
      {timeUnits.map((option) => {
        return (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        );
      })}
    </Select>,
    onChangeHandler ? { onChange: onChangeHandler } : {}
  );
};

export { TimeUnitSelector };
