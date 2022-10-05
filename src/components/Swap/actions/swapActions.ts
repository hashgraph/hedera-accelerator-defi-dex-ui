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

const setTokenToTradePoolLiquidity = (amount: number | undefined): SwapAction => {
  return { type: ActionType.SET_TOKEN_TO_TRADE, field: "poolLiquidity", payload: amount };
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

const setTokenToReceivePoolLiquidity = (amount: number | undefined): SwapAction => {
  return { type: ActionType.SET_TOKEN_TO_RECEIVE, field: "poolLiquidity", payload: amount };
};

/** SET TOKEN TO RECEIVE ACTION CREATORS */

const swapTokenToTradeAndReceive = (): SwapAction => {
  return { type: ActionType.SWITCH_TOKEN_TO_TRADE_AND_RECEIVE };
};

/** SET SPOT PRICE ACTION CREATORS */

const setSpotPrice = (spotPrice: number | undefined): SwapAction => {
  return { type: ActionType.SET_SPOT_PRICE, payload: spotPrice };
};

/** SET SWAP SETTINGS ACTION CREATORS */

const setSlippageSetting = (slippage: string): SwapAction => {
  return { type: ActionType.SET_SWAP_SETTINGS, field: "slippage", payload: slippage };
};

const setTransactionDeadlineSetting = (transactionDeadline: string): SwapAction => {
  return { type: ActionType.SET_SWAP_SETTINGS, field: "transactionDeadline", payload: transactionDeadline };
};

export {
  setTokenToTradeAmount,
  setTokenToTradeSymbol,
  setTokenToTradeBalance,
  setTokenToTradePoolLiquidity,
  setTokenToReceiveAmount,
  setTokenToReceiveSymbol,
  setTokenToReceiveBalance,
  setTokenToReceivePoolLiquidity,
  swapTokenToTradeAndReceive,
  setSpotPrice,
  setSlippageSetting,
  setTransactionDeadlineSetting,
};
