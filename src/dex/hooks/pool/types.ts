export enum PoolQueries {
  CreatePool = "createPool",
}

export enum TransactionFeeLabelValue {
  "(Use for Exotic Pairs)" = 1,
  "(Use for Most Pairs)",
  "(Use for Very Common Pairs)",
}

export interface PoolTransactionFee {
  key: number;
  label: string;
  value: number;
}
