import { BigNumber } from "bignumber.js";

interface MirrorNodeLinks {
  links: {
    next: string | null;
  };
}

interface MirrorNodeTokenByIdResponse {
  data: {
    name: string | undefined;
    symbol: string | undefined;
    token_id: string | undefined;
    decimals: number;
    total_supply: Long | null;
  };
}

interface MirrorNodeTokenPairResponse {
  data: { contract_id: string };
}

interface MirrorNodeTokenBalance {
  token_id: string;
  accountId: string;
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
  proposalId: string;
  contractId: string;
  type: string;
  proposer?: string;
  targets?: string[];
  values?: string[];
  signatures?: string[];
  calldatas?: string[];
  startBlock?: string;
  endBlock?: string;
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
  MirrorNodeTokenPairResponse,
};
