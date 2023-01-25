import { InitialTokenState } from "../constants";
import { TokenState } from "../types";
import { AddLiquidityState } from "./types";

export const InitialAddLiquidityFormState: AddLiquidityState = {
  firstToken: { ...InitialTokenState },
  secondToken: { ...InitialTokenState },
  slippage: 2.0,
  transactionDeadline: 5,
};

export type AddLiquidityFormData = {
  firstToken: TokenState;
  secondToken: TokenState;
  slippage: number;
  transactionDeadline: number;
};
