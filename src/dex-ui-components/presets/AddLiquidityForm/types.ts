import { TokenState } from "../types";

export interface AddLiquidityState {
  firstToken: TokenState;
  secondToken: TokenState;
  slippage: number | undefined;
  transactionDeadline: number | undefined;
  fee: number | undefined;
  poolName: string | undefined;
}
