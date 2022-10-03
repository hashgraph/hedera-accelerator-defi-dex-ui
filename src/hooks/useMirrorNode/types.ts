enum ActionType {
  FETCH_POOL_VOLUME_METRICS_STARTED = "useMirrorNode/FETCH_POOL_VOLUME_METRICS_STARTED",
  FETCH_POOL_VOLUME_METRICS_SUCCEEDED = "useMirrorNode/FETCH_POOL_VOLUME_METRICS_SUCCEEDED",
  FETCH_POOL_VOLUME_METRICS_FAILED = "useMirrorNode/FETCH_POOL_VOLUME_METRICS_FAILED",
}

interface PoolState {
  fee: number;
  totalVolumeLocked: number;
  past24HoursVolume: number;
  past7daysVolume: number;
}

interface UserPoolState {
  fee: number;
  liquidity: number;
  percentOfPool: number;
  unclaimedFees: number;
}

interface MirrorNodeState {
  allPoolsMetrics: Map<string, PoolState>;
  userPoolsMetrics: Map<string, UserPoolState>;
  status: string; // "init" | "fetching" | "success" | "error";
  errorMessage: string | null;
  poolVolumeMetrics: number | null;
  fetchPoolVolumeMetrics: () => Promise<void>;
}

export { ActionType };
export type { PoolState, UserPoolState, MirrorNodeState };
