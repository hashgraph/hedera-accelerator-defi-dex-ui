import { LPTokenState } from "../types";

export type WithdrawFormData = {
  lpToken: LPTokenState;
  transactionDeadline: number;
};
