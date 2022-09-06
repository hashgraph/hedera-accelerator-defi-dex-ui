import { ActionType, SwapAction } from "../actions/actionTypes";
import { SwapState } from "../types";

const initialSwapState: SwapState = {
  tokenToTrade: {
    symbol: "HBAR",
    amount: 0.0,
    balance: undefined,
  },
  tokenToReceive: {
    symbol: undefined,
    amount: 0.0,
    balance: undefined,
  },
  spotPrice: undefined,
};

function initSwapReducer(initialSwapState: SwapState) {
  return initialSwapState;
}

function swapReducer(state: SwapState, action: SwapAction) {
  switch (action.type) {
    case ActionType.SET_TOKEN_TO_TRADE: {
      const { field, payload } = action;
      return {
        ...state,
        tokenToTrade: {
          ...state.tokenToTrade,
          [field]: payload,
        },
      };
    }
    case ActionType.SET_TOKEN_TO_RECEIVE: {
      const { field, payload } = action;
      return {
        ...state,
        tokenToReceive: {
          ...state.tokenToReceive,
          [field]: payload,
        },
      };
    }
    case ActionType.SWITCH_TOKEN_TO_TRADE_AND_RECIEVE: {
      return {
        ...state,
        tokenToTrade: {
          ...state.tokenToReceive,
        },
        tokenToReceive: {
          ...state.tokenToTrade,
        },
      };
    }
    case ActionType.SET_SPOT_PRICE: {
      const { payload } = action;
      return {
        ...state,
        spotPrice: payload,
      };
    }
    default:
      throw new Error();
  }
}

export { swapReducer, initSwapReducer, initialSwapState };
