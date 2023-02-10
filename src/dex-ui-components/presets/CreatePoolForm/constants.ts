import { InitialTokenState } from "../constants";
import { TokenState } from "../types";
import { CreatePoolState } from "./types";

export const InitialCreatePoolFormState: CreatePoolState = {
  firstToken: { ...InitialTokenState },
  secondToken: { ...InitialTokenState },
  transactionFee: 30,
  transactionDeadline: 3,
};

export type CreatePoolStateFormData = {
  firstToken: TokenState;
  secondToken: TokenState;
  transactionFee: number;
  transactionDeadline: number;
};

export const InputSelectData = [
  { label: "0.3% (Use for Most Pairs)", value: 30 },
  { label: "0.05% (Use for Exotic Pairs)", value: 5 },
  { label: "0.1% (Use for Very Common Pairs)", value: 10 },
];
