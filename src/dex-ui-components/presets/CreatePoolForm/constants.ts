import { InitialTransactionFee, InitialTokenState, InitialTransactionDeadline } from "../constants";
import { TokenState } from "../types";
import { CreatePoolState } from "./types";

export const InitialCreatePoolFormState: CreatePoolState = {
  firstToken: { ...InitialTokenState },
  secondToken: { ...InitialTokenState },
  transactionFee: InitialTransactionFee,
  transactionDeadline: InitialTransactionDeadline,
};

export type CreatePoolFormData = {
  firstToken: TokenState;
  secondToken: TokenState;
  transactionFee: number;
  transactionDeadline: number;
};

export const DropdownSelectData = [
  { label: "0.3% (Use for Most Pairs)", value: 30 },
  { label: "0.05% (Use for Exotic Pairs)", value: 5 },
  { label: "0.1% (Use for Very Common Pairs)", value: 10 },
];
