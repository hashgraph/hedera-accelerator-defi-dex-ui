import { InitialTransactionDeadline } from "../constants";
import { LPTokenState } from "../types";

export type WithdrawFormData = {
  lpToken: LPTokenState;
  transactionDeadline: number;
};

export const InitialWithdrawFormState = {
  lpToken: {
    amount: 0,
    displayAmount: "0",
  },
  transactionDeadline: InitialTransactionDeadline,
};
