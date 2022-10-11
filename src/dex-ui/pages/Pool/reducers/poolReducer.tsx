import { ActionType, PoolActions } from "./actionTypes";

export interface PoolState {
  inputToken: {
    symbol: string;
    amount: number;
    displayedAmount: string;
    address: string;
    spotPrice: number;
    balance: number | undefined;
  };
  outputToken: {
    symbol: string;
    amount: number;
    displayedAmount: string;
    address: string;
    spotPrice: number;
    balance: number | undefined;
  };
}

const initialPoolState: PoolState = {
  inputToken: {
    symbol: "",
    amount: 0.0,
    displayedAmount: "0.0",
    address: "",
    spotPrice: 0,
    balance: undefined,
  },
  outputToken: {
    symbol: "",
    amount: 0.0,
    displayedAmount: "0.0",
    address: "",
    spotPrice: 0,
    balance: undefined,
  },
};

function initPoolReducer(initialPoolState: PoolState) {
  return initialPoolState;
}

function poolReducer(state: PoolState, action: PoolActions) {
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
        ...state,
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

export { poolReducer, initPoolReducer, initialPoolState };
