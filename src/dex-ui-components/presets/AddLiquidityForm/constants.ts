import { InitialTokenState, InitialSlippage, InitialTransactionDeadline } from "../constants";
import { TokenState } from "../types";
import { AddLiquidityState } from "./types";

export const InitialAddLiquidityFormState: AddLiquidityState = {
  firstToken: { ...InitialTokenState },
  secondToken: { ...InitialTokenState },
  slippage: InitialSlippage,
  transactionDeadline: InitialTransactionDeadline,
};

export type AddLiquidityFormData = {
  firstToken: TokenState;
  secondToken: TokenState;
  slippage: number;
  transactionDeadline: number;
};
