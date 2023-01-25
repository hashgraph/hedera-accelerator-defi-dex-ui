import { InitialTokenState } from "../constants";
import { SwapTokensState } from "./types";

export const InitialSwapFormState: SwapTokensState = {
  tokenToTrade: { ...InitialTokenState },
  tokenToReceive: { ...InitialTokenState },
  slippage: 2.0,
  transactionDeadline: 5,
};
