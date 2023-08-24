export enum HTSMutations {
  CreateToken = "CreateToken",
  AccountInfo = "accountInfo",
}

export enum HTSQueries {
  AccountTokenBalances = "accountTokenBalances",
  AccountsTokenBalances = "accountsTokenBalances",
  Token = "token",
  TransactionDetails = "transactionDetails",
  AccountTokenNFTs = "accountTokenNFTs",
}

export interface TokenBalance {
  name: string;
  symbol: string;
  decimals: string;
  logo: string;
  tokenId: string;
  balance: number;
  value: number;
  type: string;
}
