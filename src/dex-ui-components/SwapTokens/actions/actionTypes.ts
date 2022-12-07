import { initialSwapState } from "../reducers";

export enum ActionType {
  SET_TOKEN_TO_TRADE = "SET_TOKEN_TO_TRADE",
  SET_TOKEN_TO_RECEIVE = "SET_TOKEN_TO_RECEIVE",
  SWITCH_TOKEN_TO_TRADE_AND_RECEIVE = "SWITCH_TOKEN_TO_TRADE_AND_RECEIVE",
  SET_SPOT_PRICE = "SET_SPOT_PRICE",
  SET_SWAP_SETTINGS = "SET_SWAP_SETTINGS",
}

type TokenInputProperties = keyof typeof initialSwapState.tokenToTrade;
type SwapSettingsProperties = keyof typeof initialSwapState.swapSettings;

interface SetTokenToTrade {
  type: ActionType.SET_TOKEN_TO_TRADE;
  field: TokenInputProperties;
  payload: string | number | object | undefined;
}

interface SetTokenToReceive {
  type: ActionType.SET_TOKEN_TO_RECEIVE;
  field: TokenInputProperties;
  payload: string | number | object | undefined;
}

interface SwitchTokenToTradeAndReceiveTokens {
  type: ActionType.SWITCH_TOKEN_TO_TRADE_AND_RECEIVE;
}

interface SetSpotPrice {
  type: ActionType.SET_SPOT_PRICE;
  payload: number | undefined;
}

interface SetSwapSettings {
  type: ActionType.SET_SWAP_SETTINGS;
  field: SwapSettingsProperties;
  payload: string;
}

export type SwapAction =
  | SetTokenToTrade
  | SetTokenToReceive
  | SwitchTokenToTradeAndReceiveTokens
  | SetSpotPrice
  | SetSwapSettings;
