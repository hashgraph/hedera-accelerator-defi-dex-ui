enum ActionType {
  FETCH_ALL_POOL_METRICS_STARTED = "useMirrorNode/FETCH_ALL_POOL_METRICS_STARTED",
  FETCH_ALL_METRICS_SUCCEEDED = "useMirrorNode/FETCH_ALL_POOL_METRICS_SUCCEEDED",
  FETCH_ALL_METRICS_FAILED = "useMirrorNode/FETCH_ALL_POOL_METRICS_FAILED",
  FETCH_USER_POOL_METRICS_STARTED = "useMirrorNode/FETCH_USER_POOL_METRICS_STARTED",
  FETCH_USER_POOL_METRICS_SUCCEEDED = "useMirrorNode/FETCH_USER_POOL_METRICS_SUCCEEDED",
  FETCH_USER_POOL_METRICS_FAILED = "useMirrorNode/FETCH_USER_POOL_METRICS_FAILED",
}

/* Add Symbol */
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
  poolTokenBalances: MirrorNodeTokenBalance[];
  userTokenBalances: MirrorNodeTokenBalance[];
  status: string; // "init" | "fetching" | "success" | "error";
  errorMessage: string | null;
  fetchAllPoolMetrics: () => Promise<void>;
  fetchUserPoolMetrics: (userAccountId: string) => Promise<void>;
}

// Only for mocking for now
interface TokenPair {
  pairToken: {
    symbol: string;
    accountId: string;
  };
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
