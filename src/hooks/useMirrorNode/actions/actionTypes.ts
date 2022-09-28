import { PoolState, UserPoolState } from "../reducers/mirrorNodeReducer";

export enum ActionType {
  FETCH_POOL_VOLUME_METRICS_STARTED = "FETCH_POOL_VOLUME_METRICS_STARTED",
  FETCH_POOL_VOLUME_METRICS_SUCCEEDED = "FETCH_POOL_VOLUME_METRICS_SUCCEEDED",
  FETCH_POOL_VOLUME_METRICS_FAILED = "FETCH_POOL_VOLUME_METRICS_FAILED",
}

type AsyncAction = (dispatch: (action: any) => any) => void;

/** FETCH POOL METRICS Action Types */

interface FetchPoolVolumeMetricsStarted {
  type: ActionType.FETCH_POOL_VOLUME_METRICS_STARTED;
}

interface FetchPoolVolumeMetricsSucceeded {
  type: ActionType.FETCH_POOL_VOLUME_METRICS_SUCCEEDED;
  payload: {
    allPoolsMetrics: Map<string, PoolState>;
    userPoolsMetrics: Map<string, UserPoolState>;
  };
}

interface FetchPoolVolumeMetricsFailed {
  type: ActionType.FETCH_POOL_VOLUME_METRICS_FAILED;
  payload: string;
}

export type MirrorNodeAction =
  | AsyncAction
  | FetchPoolVolumeMetricsStarted
  | FetchPoolVolumeMetricsSucceeded
  | FetchPoolVolumeMetricsFailed;
