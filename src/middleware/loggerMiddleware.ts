import { MiddlewareAPI, Dispatch } from "@rest-hooks/use-enhanced-reducer";

function loggerMiddleware<R extends React.Reducer<any, any>>({ getState }: MiddlewareAPI<R>) {
  return (next: Dispatch<R>) => async (action: React.ReducerAction<R>) => {
    const actionType = typeof action === "function" ? "ASYNC_ACTION" : action.type;
    console.group(actionType);
    console.log("before", getState());
    await next(action);
    console.log("after", getState());
    console.groupEnd();
  };
}

export { loggerMiddleware };
