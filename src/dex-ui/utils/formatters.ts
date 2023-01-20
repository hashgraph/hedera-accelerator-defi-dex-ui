import { isNil } from "ramda";

const HashscanUrl = "https://hashscan.io";

type HashScanTransactionLink = `https://hashscan.io/${
  | "testnet"
  | "mainnet"}/transactionsById/${string}-${string}-${string}`;

/**
 * Creates a hashscan URL given a valid transaction id.
 * @param transactionId - The transaction id returned from a hedera transaction.
 * @returns The formatted hashscan URL to view details of the specified transaction.
 * @example
 * ```
 * Input: transactionId = "0.0.34744739@1665448985.817445871"
 * Output: return "https://hashscan.io/#/testnet/transactionsById/0.0.34744739-1665448985-817445871"
 * ```
 */
export const createHashScanTransactionLink = (
  transactionId: string | undefined
): HashScanTransactionLink | undefined => {
  if (isNil(transactionId)) return;
  const [id, timestamp] = transactionId.split("@");
  if (isNil(timestamp)) return;
  const [seconds, nanoSeconds] = timestamp.split(".");
  // TODO: set testnet/mainnet based on network
  return `${HashscanUrl}/testnet/transactionsById/${id}-${seconds}-${nanoSeconds}`;
};

/**
 * Creates a hashscan URL given a valid account id.
 * @param accountId - The account id.
 * @returns The formatted hashscan URL to view details of a specific account.
 */
export const createHashScanAccountIdLink = (accountId: string): string => {
  // TODO: set testnet/mainnet based on network
  return `${HashscanUrl}/testnet/account/${accountId}`;
};
