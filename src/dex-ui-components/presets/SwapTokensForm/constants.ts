import { InitialTransactionDeadline } from "./../constants";
import { InitialSlippage, InitialTokenState } from "../constants";
import { SwapTokensState } from "./types";

export const InitialSwapFormState: SwapTokensState = {
  tokenToTrade: { ...InitialTokenState },
  tokenToReceive: { ...InitialTokenState },
  slippage: InitialSlippage,
  transactionDeadline: InitialTransactionDeadline,
};
