import { isNil } from "ramda";
import { HashscanData } from "../../shared/ui-kit";

const HashScanUrl = "https://hashscan.io";

type HashScanTransactionLink = `https://hashscan.io/${
  | "testnet"
  | "mainnet"}/transactionsById/${string}-${string}-${string}`;
type HashScanAccountIdLink = `https://hashscan.io/${"testnet" | "mainnet"}/account/${string}`;
type HashScanTokenIdLink = `https://hashscan.io/${"testnet" | "mainnet"}/token/${string}`;
type HashScanLink = HashScanTransactionLink | HashScanAccountIdLink | HashScanTokenIdLink;

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
export function createHashScanTransactionLink(transactionId: string | undefined): HashScanTransactionLink | "" {
  if (isNil(transactionId)) return "";
  const [id, timestamp] = transactionId.split("@");
  if (isNil(timestamp)) return "";
  const [seconds, nanoSeconds] = timestamp.split(".");
  // TODO: set testnet/mainnet based on network
  return `${HashScanUrl}/testnet/transactionsById/${id}-${seconds}-${nanoSeconds}`;
}

/**
 * Creates a hashscan URL given a valid account id.
 * @param accountId - The account id.
 * @returns The formatted hashscan URL to view details of a specific account.
 */
export function createHashScanAccountIdLink(accountId: string): HashScanAccountIdLink {
  // TODO: set testnet/mainnet based on network
  return `${HashScanUrl}/testnet/account/${accountId}`;
}

/**
 * Creates a hashscan URL given a valid token id.
 * @param tokenId - The token id.
 * @returns The formatted hashscan URL to view details of a specific token.
 */
export function createHashScanTokenIdLink(tokenId: string): HashScanTokenIdLink {
  // TODO: set testnet/mainnet based on network
  return `${HashScanUrl}/testnet/token/${tokenId}`;
}

export function createHashScanLink(id: string, type: HashscanData): HashScanLink | "" {
  switch (type) {
    case HashscanData.Account:
      return createHashScanAccountIdLink(id);
    case HashscanData.Token:
      return createHashScanTokenIdLink(id);
    case HashscanData.Transaction:
      return createHashScanTransactionLink(id);
    default:
      return "";
  }
}
