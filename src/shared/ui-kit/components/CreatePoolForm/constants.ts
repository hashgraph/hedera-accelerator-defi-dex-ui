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
