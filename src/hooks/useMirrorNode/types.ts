enum ActionType {
  FETCH_POOL_VOLUME_METRICS_STARTED = "useMirrorNode/FETCH_POOL_VOLUME_METRICS_STARTED",
  FETCH_POOL_VOLUME_METRICS_SUCCEEDED = "useMirrorNode/FETCH_POOL_VOLUME_METRICS_SUCCEEDED",
  FETCH_POOL_VOLUME_METRICS_FAILED = "useMirrorNode/FETCH_POOL_VOLUME_METRICS_FAILED",
}

interface PoolState {
  name: string;
  fee: number;
  totalVolumeLocked: number;
  past24HoursVolume: number;
  past7daysVolume: number;
}

interface UserPoolState {
  name: string;
  fee: number;
  liquidity: number;
  percentOfPool: number;
  unclaimedFees: number;
}

interface MirrorNodeState {
  allPoolsMetrics: PoolState[];
  userPoolsMetrics: UserPoolState[];
  status: string; // "init" | "fetching" | "success" | "error";
  errorMessage: string | null;
  poolVolumeMetrics: number | null;
  fetchAllPoolMetrics: () => Promise<void>;
}

interface TokenPair {
  tokenA: {
    symbol: string;
    accountId: string;
  };
  tokenB: {
    symbol: string;
    accountId: string;
  };
}

export { ActionType };
export type { PoolState, UserPoolState, MirrorNodeState, TokenPair };
