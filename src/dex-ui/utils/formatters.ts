export const createHashScanLink = (transactionId: string | undefined) => {
  const urlFormattedTimestamp = transactionId?.split("@")[1].replace(".", "-");
  const formattedTransactionId = `${transactionId?.split("@")[0]}-${urlFormattedTimestamp}`;
  // format: https://hashscan.io/#/testnet/transaction/0.0.34744739-1665448985-817445871
  // TODO: set testnet/mainnet based on network
  return `https://hashscan.io/testnet/transaction/${formattedTransactionId}`;
};
