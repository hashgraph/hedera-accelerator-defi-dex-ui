import { TokenState } from "../types";

export interface CreatePoolState {
  firstToken: TokenState;
  secondToken: TokenState;
  transactionFee: number;
  transactionDeadline: number | undefined;
}
export interface CreatePoolTransactionParams {
  firstToken: {
    symbol: string;
    address: string;
    quantity: number;
  };
  secondToken: {
    symbol: string;
    address: string;
    quantity: number;
  };
  transactionFee: number;
  transactionDeadline: number;
}
