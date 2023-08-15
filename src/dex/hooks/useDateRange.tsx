import { useState } from "react";

export function useDateRange(initialStartDateValue: Date | null, initialEndDateValue: Date | null) {
  const [startDate, setStartDate] = useState(initialStartDateValue);
  const [endDate, setEndDate] = useState(initialEndDateValue);

  function handleChange(startDate: Date | null, endDate: Date | null) {
    setStartDate(startDate);
    setEndDate(endDate);
  }
  return {
    startDate,
    endDate,
    handleChange,
  };
}
