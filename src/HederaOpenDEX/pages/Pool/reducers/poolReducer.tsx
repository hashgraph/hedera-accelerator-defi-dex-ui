import { ActionType, PoolActions } from "./actionTypes";

export interface PoolState {
  inputToken: {
    symbol: string;
    amount: number;
    address: string;
  };
  outputToken: {
    symbol: string;
    amount: number;
    address: string;
  };
  poolBalances: {
    [symbol: string]: {
      amount: number;
      address: string;
    }
  };
}

const initialPoolState: PoolState = {
  inputToken: {
    symbol: "",
    amount: 0.0,
    address: ""
  },
  outputToken: {
    symbol: "",
    amount: 0.0,
    address: ""
  },
  poolBalances: {
    L49A: {
      amount: 0,
      address: "0.0.47646195"
    },
    L49B: {
      amount: 0,
      address: "0.0.47646196"
    }
  }
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
    // case ActionType.GET_POOL_LIQUIDITY_STARTED: {
    //   return state;
    // }
    // case ActionType.GET_POOL_LIQUIDITY_SUCCESSFUL: {
    //   const { poolBalances } = action;
    //   return {
    //     ...state,
    //     poolBalances
    //   };
    // }
    // case ActionType.GET_POOL_LIQUIDITY_FAILED: {
    //   return state;
    // }
    default:
      throw new Error();
  }
}

export { poolReducer, initPoolReducer, initialPoolState };
