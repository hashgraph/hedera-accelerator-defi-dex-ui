import { ChangeEvent, useState } from "react";

/**
 * Regex pattern used to restrict the values a user can enter in a token input component.
 *
 * @remarks
 * - The regex `/^(0|[1-9]\d*)?(\.\d*)?$/` matches a floating-point number in the string.
 * - The first part of the regex, `^(0|[1-9]\d*)?`, matches an optional leading zero or a sequence of one or more
 * digits.
 * - The second part of the regex, `(\.\d*)?`, matches an optional decimal point followed by zero or more digits.
 * @example
 * For example, the following strings would all match the regex:
 * ```
 * "0"
 * "1.23"
 * "0.123"
 * "123"
 * "."
 * ```
 * @example
 * The following strings would not match the regex:
 * ```
 * "abc"
 * "123.a"
 * "-1.23"
 * ```
 */
const TokenInputPattern = /^(0|[1-9]\d*)?(\.\d*)?$/;

export function useFormTokenInputPattern(valueSetter: (value: string) => void) {
  const [previousValue, setPreviousValue] = useState("");

  function handleTokenInputChangeWithPattern(event: ChangeEvent<HTMLSelectElement>) {
    if (!TokenInputPattern.test(event.target.value)) {
      return valueSetter(previousValue);
    }
    setPreviousValue(event.target.value);
    valueSetter(event.target.value);
  }

  return {
    previousValue,
    handleTokenInputChangeWithPattern,
  };
}
