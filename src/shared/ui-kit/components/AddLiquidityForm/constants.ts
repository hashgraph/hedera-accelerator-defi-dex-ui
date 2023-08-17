import { InitialTokenState, InitialSlippage, InitialTransactionDeadline, InitialTransactionFee } from "../constants";
import { TokenState } from "../types";
import { AddLiquidityState } from "./types";

export const InitialAddLiquidityFormState: AddLiquidityState = {
  firstToken: { ...InitialTokenState },
  secondToken: { ...InitialTokenState },
  slippage: InitialSlippage,
  transactionDeadline: InitialTransactionDeadline,
  fee: InitialTransactionFee,
  poolName: "",
};

export type AddLiquidityFormData = {
  firstToken: TokenState;
  secondToken: TokenState;
  slippage: number;
  transactionDeadline: number;
  fee: number;
  poolName: string;
};
