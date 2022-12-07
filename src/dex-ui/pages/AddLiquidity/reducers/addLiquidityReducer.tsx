import { ActionType, AddLiquidityActions } from "./actionTypes";

export interface AddLiquidityState {
  inputToken: {
    poolLiquidity: number | undefined;
    address: string;
    spotPrice: number;
    symbol: string | undefined;
    amount: number;
    displayAmount: string;
    displayedAmount: string;
    balance: number | undefined;
    tokenName: string | undefined;
    totalSupply: Long | null;
    maxSupply: Long | null;
    tokenMeta: {
      pairContractId: string | undefined;
      tokenId: string | undefined;
    };
  };
  outputToken: {
    poolLiquidity: number | undefined;
    address: string;
    spotPrice: number;
    symbol: string | undefined;
    amount: number;
    displayAmount: string;
    displayedAmount: string;
    balance: number | undefined;
    tokenName: string | undefined;
    totalSupply: Long | null;
    maxSupply: Long | null;
    tokenMeta: {
      pairContractId: string | undefined;
      tokenId: string | undefined;
    };
  };
}

const initialPoolState: AddLiquidityState = {
  inputToken: {
    symbol: "",
    amount: 0.0,
    displayAmount: "0.0",
    displayedAmount: "0.0",
    address: "",
    spotPrice: 0,
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: undefined,
    totalSupply: null,
    maxSupply: null,
    tokenMeta: {
      pairContractId: undefined,
      tokenId: undefined,
    },
  },
  outputToken: {
    symbol: "",
    amount: 0.0,
    displayAmount: "0.0",
    displayedAmount: "0.0",
    address: "",
    spotPrice: 0,
    balance: undefined,
    poolLiquidity: undefined,
    tokenName: undefined,
    totalSupply: null,
    maxSupply: null,
    tokenMeta: {
      pairContractId: undefined,
      tokenId: undefined,
    },
  },
};

function initPoolReducer(initialPoolState: AddLiquidityState) {
  return initialPoolState;
}

function poolReducer(state: AddLiquidityState, action: AddLiquidityActions) {
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
