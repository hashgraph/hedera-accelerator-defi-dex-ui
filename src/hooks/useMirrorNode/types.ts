enum ActionType {
  FETCH_POOL_METRICS_STARTED = "useMirrorNode/FETCH_POOL_METRICS_STARTED",
  FETCH_POOL_METRICS_SUCCEEDED = "useMirrorNode/FETCH_POOL_METRICS_SUCCEEDED",
  FETCH_POOL_METRICS_FAILED = "useMirrorNode/FETCH_POOL_METRICS_FAILED",
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

interface MirrorNodeTokenBalance {
  token_id: string;
  balance: number;
}

interface MirrorNodeAccountBalance {
  account: string;
  balance: number;
  tokens: MirrorNodeTokenBalance[];
}

interface MirrorNodeTokenTransfer {
  token_id: string;
  account: string;
  amount: number;
  is_approval: boolean;
}
interface MirrorNodeTransaction {
  bytes: null;
  charged_tx_fee: number;
  consensus_timestamp: string;
  entity_id: string;
  max_fee: number;
  memo_base64: null;
  name: string;
  node: string;
  nonce: number;
  parent_consensus_timestamp: string;
  result: string;
  scheduled: false;
  transaction_hash: string;
  transaction_id: string;
  token_transfers: MirrorNodeTokenTransfer[];
}

export { ActionType };
export type {
  PoolState,
  UserPoolState,
  MirrorNodeState,
  MirrorNodeTokenBalance,
  MirrorNodeTransaction,
  MirrorNodeAccountBalance,
  MirrorNodeTokenTransfer,
  TokenPair,
};
