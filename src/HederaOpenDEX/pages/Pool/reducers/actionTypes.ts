export enum ActionType {
  UPDATE_INPUT_TOKEN = "UPDATE_INPUT_TOKEN",
  UPDATE_OUTPUT_TOKEN = "UPDATE_OUTPUT_TOKEN",
  SWITCH_INPUT_AND_OUTPUT_TOKEN = "SWITCH_INPUT_AND_OUTPUT_TOKEN",
  // GET_POOL_LIQUIDITY_STARTED = "GET_POOL_LIQUIDITY_STARTED",
  // GET_POOL_LIQUIDITY_SUCCESSFUL = "GET_POOL_LIQUIDITY_SUCCESSFUL",
  // GET_POOL_LIQUIDITY_FAILED = "GET_POOL_LIQUIDITY_FAILED",
}

interface UpdateInputToken {
  type: ActionType.UPDATE_INPUT_TOKEN;
  field: string;
  payload: string | number;
}

interface UpdateOutputToken {
  type: ActionType.UPDATE_OUTPUT_TOKEN;
  field: string;
  payload: string | number;
}

interface SwitchTokens {
  type: ActionType.SWITCH_INPUT_AND_OUTPUT_TOKEN;
}

// interface GetPoolLiquidityStarted {
//   type: ActionType.GET_POOL_LIQUIDITY_STARTED;
// }

// interface GetPoolLiquiditySuccessful {
//   type: ActionType.GET_POOL_LIQUIDITY_SUCCESSFUL;
//   poolBalances: {
//     [symbol: string]: {
//       amount: number;
//       address: string;
//     }
//   }
// }

// interface GetPoolLiquidityFailed {
//   type: ActionType.GET_POOL_LIQUIDITY_FAILED;
//   errorMessage: string;
// }

export type PoolActions = UpdateInputToken | UpdateOutputToken | SwitchTokens;
// | GetPoolLiquidityStarted
// | GetPoolLiquiditySuccessful
// | GetPoolLiquidityFailed;
