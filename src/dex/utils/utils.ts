import { ethers } from "ethers";
import { AccountId } from "@hashgraph/sdk";
import { isNotNil } from "ramda";

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

export function convertToByte32(hexString: string): Uint8Array {
  return ethers.utils.arrayify(ethers.utils.hexlify(hexString));
}

export function checkForValidTokenId(tokenId: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(tokenId);
}

export function checkForValidAccountId(accountId: string): boolean {
  try {
    return isNotNil(AccountId.fromString(accountId));
  } catch {
    return false;
  }
}

export function convertNumberToPercentage(number: number, decimalPoint = 2): number {
  return Number((number / 100).toFixed(decimalPoint));
}
