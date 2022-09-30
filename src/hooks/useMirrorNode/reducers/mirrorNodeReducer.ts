import { ActionType, MirrorNodeAction } from "../actions/actionTypes";

export interface PoolState {
  fee: number;
  totalVolumeLocked: number;
  past24HoursVolume: number;
  past7daysVolume: number;
}

export interface UserPoolState {
  fee: number;
  liquidity: number;
  percentOfPool: number;
  unclaimedFees: number;
}

export interface MirrorNodeState {
  allPoolsMetrics: Map<string, PoolState>;
  userPoolsMetrics: Map<string, UserPoolState>;
  status: "init" | "fetching" | "success" | "error";
  errorMessage: string | null;
}

const initialMirrorNodeState: MirrorNodeState = {
  allPoolsMetrics: new Map(),
  userPoolsMetrics: new Map(),
  status: "init",
  errorMessage: null,
};

function mirrorNodeReducer(draft: MirrorNodeState, action: MirrorNodeAction) {
  if (typeof action === "function") {
    return draft;
  }
  switch (action.type) {
    case ActionType.FETCH_POOL_VOLUME_METRICS_STARTED: {
      draft.status = "fetching";
      return draft;
    }
    case ActionType.FETCH_POOL_VOLUME_METRICS_SUCCEEDED: {
      const { payload } = action;
      const { allPoolsMetrics, userPoolsMetrics } = payload;
      draft.status = "success";
      draft.allPoolsMetrics = { ...allPoolsMetrics };
      draft.userPoolsMetrics = { ...userPoolsMetrics };
      return draft;
    }
    case ActionType.FETCH_POOL_VOLUME_METRICS_FAILED: {
      const { payload } = action;
      draft.status = "error";
      draft.errorMessage = payload;
      return draft;
    }
  }
}

export { mirrorNodeReducer, initialMirrorNodeState };
