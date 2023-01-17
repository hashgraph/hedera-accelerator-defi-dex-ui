import { ChangeEvent, useState } from "react";

export function useInput<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value as T);
  }

  return {
    value,
    handleChange,
  };
}

export function useDates<T, Z>(initialStartDateValue: T, initialEndDateValue: Z) {
  const [startDate, setStartDate] = useState(initialStartDateValue);
  const [endDate, setEndDate] = useState(initialEndDateValue);

  function handleChange(startDate: any, endDate: any) {
    setStartDate(startDate);
    setEndDate(endDate);
  }

  return {
    startDate,
    endDate,
    handleChange,
  };
}
