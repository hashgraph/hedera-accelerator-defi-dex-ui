export interface PoolState {
  name: string;
  fee: number;
  totalVolumeLocked: number;
  past24HoursVolume: number;
  past7daysVolume: number;
}

export interface UserPoolMetrics {
  name: string;
  fee: number;
  liquidity: number;
  percentOfPool: number;
  unclaimedFees: number;
}

export interface TokenBalance {
  /** Should update this field to be tokenId */
  token_id: string;
  balance: number;
  name?: string; // TODO: need a mapping for id to name (probably get directly from contract)
}
