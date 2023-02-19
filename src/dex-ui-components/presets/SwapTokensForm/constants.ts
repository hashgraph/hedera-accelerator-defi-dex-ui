import { InitialTokenState, InitialTransactionDeadline, InitialSlippage } from "../constants";
import { SwapTokensState } from "./types";

export const InitialSwapFormState: SwapTokensState = {
  tokenToTrade: { ...InitialTokenState },
  tokenToReceive: { ...InitialTokenState },
  slippage: InitialSlippage,
  transactionDeadline: InitialTransactionDeadline,
};
