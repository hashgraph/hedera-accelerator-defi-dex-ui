import { ActionType, SwapActions } from "./actionTypes";

export interface SwapState {
  inputToken: {
    symbol: string;
    amount: number;
  };
  outputToken: {
    symbol: string;
    amount: number;
  };
}

const initialSwapState: SwapState = {
  inputToken: {
    symbol: "",
    amount: 0.0,
  },
  outputToken: {
    symbol: "",
    amount: 0.0,
  },
};

function initSwapReducer(initialSwapState: SwapState) {
  return initialSwapState;
}

function swapReducer(state: SwapState, action: SwapActions) {
  switch (action.type) {
    case ActionType.UPDATE_INPUT_TOKEN: {
      const { field, payload } = action;
      return {
        ...state,
        inputToken: {
          ...state.inputToken,
          [field]: payload,
        },
      };
    }
    case ActionType.UPDATE_OUTPUT_TOKEN: {
      const { field, payload } = action;
      return {
        ...state,
        outputToken: {
          ...state.outputToken,
          [field]: payload,
        },
      };
    }
    case ActionType.SWITCH_INPUT_AND_OUTPUT_TOKEN: {
      return {
        inputToken: {
          ...state.outputToken,
        },
        outputToken: {
          ...state.inputToken,
        },
      };
    }
    default:
      throw new Error();
  }
}

export { swapReducer, initSwapReducer, initialSwapState };
