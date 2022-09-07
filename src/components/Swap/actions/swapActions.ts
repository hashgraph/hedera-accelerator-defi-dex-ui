import { ActionType, SwapAction } from "./actionTypes";

/** SET TOKEN TO TRADE ACTION CREATORS */

const setTokenToTradeAmount = (amount: number): SwapAction => {
  return { type: ActionType.SET_TOKEN_TO_TRADE, field: "amount", payload: amount };
};

const setTokenToTradeSymbol = (symbol: string | undefined): SwapAction => {
  return { type: ActionType.SET_TOKEN_TO_TRADE, field: "symbol", payload: symbol };
};

const setTokenToTradeBalance = (balance: number | undefined): SwapAction => {
  return { type: ActionType.SET_TOKEN_TO_TRADE, field: "balance", payload: balance };
};

/** SET TOKEN TO RECEIVE ACTION CREATORS */

const setTokenToReceiveAmount = (amount: number): SwapAction => {
  return { type: ActionType.SET_TOKEN_TO_RECEIVE, field: "amount", payload: amount };
};

const setTokenToReceiveSymbol = (symbol: string | undefined): SwapAction => {
  return { type: ActionType.SET_TOKEN_TO_RECEIVE, field: "symbol", payload: symbol };
};

const setTokenToReceiveBalance = (balance: number | undefined): SwapAction => {
  return { type: ActionType.SET_TOKEN_TO_RECEIVE, field: "balance", payload: balance };
};

const setSpotPrice = (spotPrice: number | undefined): SwapAction => {
  return { type: ActionType.SET_SPOT_PRICE, payload: spotPrice };
};

export {
  setTokenToTradeAmount,
  setTokenToTradeSymbol,
  setTokenToTradeBalance,
  setTokenToReceiveAmount,
  setTokenToReceiveSymbol,
  setTokenToReceiveBalance,
  setSpotPrice,
};
