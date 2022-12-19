import { isNil } from "ramda";

type HashScanLink = `https://hashscan.io/${"testnet" | "mainnet"}/transactionsById/${string}-${string}-${string}`;

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
export const createHashScanLink = (transactionId: string | undefined): HashScanLink | undefined => {
  if (isNil(transactionId)) return;
  const [id, timestamp] = transactionId.split("@");
  if (isNil(timestamp)) return;
  const [seconds, nanoSeconds] = timestamp.split(".");
  // TODO: set testnet/mainnet based on network
  return `https://hashscan.io/testnet/transactionsById/${id}-${seconds}-${nanoSeconds}`;
};
