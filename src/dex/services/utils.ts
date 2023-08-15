import { Result } from "ethers/lib/utils";
import { isIterable } from "../utils";

/**
 * Returns the [named key]:value pairs in a Result object. String keys
 * are assumed to be the named arguments of an Event.
 * @remarks
 * The ethers Result object is an associative array that contains both number indexed
 * and string named key:value pairs.
 * @example Result args
 * ```typescript
 * [
 *  "0x8aCd85898458400f7Db866d53FCFF6f0D49741FF"
 *  daoAddress: "0x8aCd85898458400f7Db866d53FCFF6f0D49741FF",
 * ]
 * ```
 * getEventArgumentsByName(args)
 * ```typescript
 * {
 *  daoAddress: "0x8aCd85898458400f7Db866d53FCFF6f0D49741FF"
 * }
 * ```
 * @param args - The Result of an emitted Event.
 * @param excludedKeys - An optional array of keys to exclude from the Result object filtering.
 * This is typically useful for differentiating between a value that is an Array and
 * a Result (associative array created by an emitted event).
 * @returns A Record containing the [named key]:value pairs in a Result.
 */
export function getEventArgumentsByName<EventLog extends Record<string, any>>(
  args: Result,
  excludedKeys: string[] = []
): EventLog {
  const namedArguments: Record<string, any> = {} as EventLog;
  for (const key in args) {
    const isNamedArgument = Number.isNaN(Number(key));
    if (isNamedArgument) {
      const arg = args[key];
      const shouldFilterArg = isIterable(arg) && typeof arg !== "string" && !excludedKeys.includes(key);
      namedArguments[key] = shouldFilterArg ? getEventArgumentsByName<EventLog>(arg, excludedKeys) : arg;
    }
  }
  return namedArguments as EventLog;
}
