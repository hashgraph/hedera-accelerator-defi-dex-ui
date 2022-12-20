export enum ActionType {
  UPDATE_INPUT_TOKEN = "UPDATE_INPUT_TOKEN",
  UPDATE_OUTPUT_TOKEN = "UPDATE_OUTPUT_TOKEN",
  SWITCH_INPUT_AND_OUTPUT_TOKEN = "SWITCH_INPUT_AND_OUTPUT_TOKEN",
}

interface UpdateInputToken {
  type: ActionType.UPDATE_INPUT_TOKEN;
  field: string;
  payload: string | number | object | undefined;
}

interface UpdateOutputToken {
  type: ActionType.UPDATE_OUTPUT_TOKEN;
  field: string;
  payload: string | number | object | undefined;
}

interface SwitchTokens {
  type: ActionType.SWITCH_INPUT_AND_OUTPUT_TOKEN;
}

export type AddLiquidityActions = UpdateInputToken | UpdateOutputToken | SwitchTokens;
