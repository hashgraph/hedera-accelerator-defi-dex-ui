import { ActionType, SwapAction } from "../actions/actionTypes";
import { SwapTokensState } from "../types";

const initialSwapState: SwapTokensState = {
  tokenToTrade: {
    symbol: undefined,
    amount: 0.0,
    displayAmount: "0.0",
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: undefined,
    totalSupply: null,
    maxSupply: null,
    tokenMeta: {
      pairAccountId: undefined,
      tokenId: undefined,
    },
  },
  tokenToReceive: {
    symbol: undefined,
    amount: 0.0,
    displayAmount: "0.0",
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: undefined,
    totalSupply: null,
    maxSupply: null,
    tokenMeta: {
      pairAccountId: undefined,
      tokenId: undefined,
    },
  },
  swapSettings: {
    slippage: "2.0",
    transactionDeadline: "5",
  },
  spotPrice: undefined,
};

function initSwapReducer(initialSwapState: SwapTokensState) {
  return initialSwapState;
}

function swapReducer(draft: SwapTokensState, action: SwapAction) {
  switch (action.type) {
    case ActionType.SET_TOKEN_TO_TRADE: {
      const { field, payload } = action;
      draft.tokenToTrade = { ...draft.tokenToTrade, [field]: payload };
      break;
    }
    case ActionType.SET_TOKEN_TO_RECEIVE: {
      const { field, payload } = action;
      draft.tokenToReceive = { ...draft.tokenToReceive, [field]: payload };
      break;
    }
    case ActionType.SWITCH_TOKEN_TO_TRADE_AND_RECEIVE: {
      const previousTokenToTrade = { ...draft.tokenToTrade };
      draft.tokenToTrade = { ...draft.tokenToReceive };
      draft.tokenToReceive = { ...previousTokenToTrade };
      break;
    }
    case ActionType.SET_SPOT_PRICE: {
      const { payload } = action;
      draft.spotPrice = payload;
      break;
    }
    case ActionType.SET_SWAP_SETTINGS: {
      const { field, payload } = action;
      draft.swapSettings = { ...draft.swapSettings, [field]: payload };
      break;
    }
    default:
      throw new Error();
  }
}

export { swapReducer, initSwapReducer, initialSwapState };
