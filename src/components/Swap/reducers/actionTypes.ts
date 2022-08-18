export enum ActionType {
  UPDATE_INPUT_TOKEN = "UPDATE_INPUT_TOKEN",
  UPDATE_OUTPUT_TOKEN = "UPDATE_OUTPUT_TOKEN",
  SWITCH_INPUT_AND_OUTPUT_TOKEN = "SWITCH_INPUT_AND_OUTPUT_TOKEN",
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

export type SwapActions = UpdateInputToken | UpdateOutputToken | SwitchTokens;
