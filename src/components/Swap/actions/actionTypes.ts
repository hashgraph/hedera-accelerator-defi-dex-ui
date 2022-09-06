export enum ActionType {
  SET_TOKEN_TO_TRADE = "SET_TOKEN_TO_TRADE",
  SET_TOKEN_TO_RECEIVE = "SET_TOKEN_TO_RECEIVE",
  SWITCH_TOKEN_TO_TRADE_AND_RECIEVE = "SWITCH_TOKEN_TO_TRADE_AND_RECIEVE",
  SET_SPOT_PRICE = "SET_SPOT_PRICE",
}

interface SetTokenToTrade {
  type: ActionType.SET_TOKEN_TO_TRADE;
  field: string;
  payload: string | number | undefined;
}

interface SetTokenToReceive {
  type: ActionType.SET_TOKEN_TO_RECEIVE;
  field: string;
  payload: string | number | undefined;
}

interface SwitchTokenToTradeAndRecieveTokens {
  type: ActionType.SWITCH_TOKEN_TO_TRADE_AND_RECIEVE;
}

interface SetSpotPrice {
  type: ActionType.SET_SPOT_PRICE;
  payload: number | undefined;
}
export type SwapAction = SetTokenToTrade | SetTokenToReceive | SwitchTokenToTradeAndRecieveTokens | SetSpotPrice;
