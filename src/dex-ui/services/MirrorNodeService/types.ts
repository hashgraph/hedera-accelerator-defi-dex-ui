import { BigNumber } from "bignumber.js";

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

interface MirrorNodeLinks {
  links: {
    next: string | null;
  };
}

interface MirrorNodeTokenByIdResponse {
  data: { decimals: number; symbol: string; token_id: string };
}

interface MirrorNodeTokenPairResponse {
  data: { contract_id: string };
}

interface MirrorNodeTokenBalance {
  token_id: string;
  balance: BigNumber;
  decimals?: string;
}

interface MirrorNodeBalanceResponse {
  timestamp: string;
  balances: MirrorNodeAccountBalance[];
  links: MirrorNodeLinks;
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

interface MirrorNodeProposalEventLog {
  data: string;
  topics: string[];
}

interface MirrorNodeDecodedProposalEvent {
  proposalId: BigNumber;
  proposer?: string;
  targets?: string[];
  values?: BigNumber[];
  signatures?: string[];
  calldatas?: BigNumber[];
  startBlock?: BigNumber;
  endBlock?: BigNumber;
  description?: string;
}

export type {
  MirrorNodeTokenByIdResponse,
  MirrorNodeTokenBalance,
  MirrorNodeTransaction,
  MirrorNodeBalanceResponse,
  MirrorNodeAccountBalance,
  MirrorNodeTokenTransfer,
  MirrorNodeProposalEventLog,
  MirrorNodeDecodedProposalEvent,
  TokenPair,
  MirrorNodeTokenPairResponse,
};
