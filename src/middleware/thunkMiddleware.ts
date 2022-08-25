import { Reducer, ReducerAction } from "react";
import { MiddlewareAPI, Dispatch } from "@rest-hooks/use-enhanced-reducer";
import { HashConnectState } from "../hooks/useHashConnect/reducers/hashConnectReducer";
import { HashConnectAction } from "../hooks/useHashConnect/actions/actionsTypes";

function thunkMiddleware<R extends React.Reducer<HashConnectState, HashConnectAction>>({
  getState,
  dispatch,
}: MiddlewareAPI<R>) {
  return (next: Dispatch<R>) => async (action: ReducerAction<R>) => {
    if (typeof action === "function") {
      return action(dispatch);
    }
    return next(action);
  };
}

export { thunkMiddleware };
