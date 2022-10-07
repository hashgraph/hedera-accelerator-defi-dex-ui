import { ReducerAction } from "react";
import { MiddlewareAPI, Dispatch } from "@rest-hooks/use-enhanced-reducer";

function thunkMiddleware<R extends React.Reducer<unknown, unknown>>({ getState, dispatch }: MiddlewareAPI<R>) {
  return (next: Dispatch<R>) => async (action: ReducerAction<R>) => {
    if (typeof action === "function") {
      return action(dispatch);
    }
    return next(action);
  };
}

export { thunkMiddleware };
