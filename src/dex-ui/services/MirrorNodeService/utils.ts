/**
 * Gathers all values from an array of fulfilled settled promise results.
 * @param promiseSettledResults - An array of settled promise results. Intended to come from
 * a Promise.allSettled call.
 * @returns An array of values from the fulfilled promises.
 */
export function getFulfilledResultsData<T>(promiseSettledResults: Array<PromiseSettledResult<T[]>>): T[] {
  return promiseSettledResults.reduce((values: T[], promiseSettledResult: PromiseSettledResult<T[]>): T[] => {
    if (promiseSettledResult.status === "fulfilled") return [...values, ...promiseSettledResult.value];
    return values;
  }, []);
}
