/**
 * Determines whether the given `value` is iterable.
 * @param value - The value to check.
 * @returns True if the value is iterable, false otherwise.
 */
export function isIterable(value: any): boolean {
  if (value === undefined || value === null) {
    return false;
  }
  return typeof value[Symbol.iterator] === "function";
}
