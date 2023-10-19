import { ChangeEvent, useState } from "react";

/**
 * Regex pattern used to restrict the values a user can enter in a time input component.
 *
 * @remarks
 * - The regex `/^[0-9]*$/` matches a whole number in the string.
 * @example
 * For example, the following strings would all match the regex:
 * ```
 * "0"
 * "1"
 * "123"
 * "."
 * ```
 * @example
 * The following strings would not match the regex:
 * ```
 * "abc"
 * "1.23"
 * "0.123"
 * "123.a"
 * "-1.23"
 * ```
 */
const TimeInputPattern = /^[0-9]*$/;

export function useTimeInputPattern(valueSetter: (value: number) => void) {
  const [previousValue, setPreviousValue] = useState(0);

  function handleTimeInputChangeWithPattern(event: ChangeEvent<HTMLSelectElement>) {
    if (!TimeInputPattern.test(event.target.value)) {
      return valueSetter(previousValue);
    }
    setPreviousValue(Number(event.target.value));
    valueSetter(Number(event.target.value));
  }

  return {
    handleTimeInputChangeWithPattern,
  };
}
