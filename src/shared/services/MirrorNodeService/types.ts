import { GovernanceProposalType } from "@dex/store";
import { BigNumber } from "bignumber.js";
import Long from "long";

interface MirrorNodeLinks {
  links: {
    next: string | null;
  };
}

interface TokenProperties {
  decimals: string;
  precision: number;
}

interface MirrorNodeTokenById {
  data: TokenProperties & {
    admin_key: {
      _type: string;
      key: string;
    };
    auto_renew_account: string;
    auto_renew_period: number;
    created_timestamp: string;
    custom_fees: {
      created_timestamp: string;
      fixed_fees: unknown[];
      fractional_fees: unknown[];
    };
    decimals: string;
    deleted: boolean;
    expiry_timestamp: number;
    fee_schedule_key: string | null;
    freeze_default: boolean;
    freeze_key: string | null;
    initial_supply: string | null;
    kyc_key: string | null;
    max_supply: string;
    memo: string;
    modified_timestamp: string;
    name: string;
    pause_key: string | null;
    pause_status: string;
    supply_key: {
      _type: string;
      key: string;
    };
    supply_type: string;
    symbol: string;
    token_id: string;
    total_supply: Long | null;
    treasury_account_id: string;
    type: string;
    wipe_key: null;
  };
}

interface MirrorNodeAccountById {
  account: string;
  key: {
    _type: string;
    key: string;
  };
  evm_address?: string;
}

interface MirrorNodeTokenPairResponse {
  data: { contract_id: string; evm_address: string; account: string };
}

interface MirrorNodeTokenBalance {
  token_id: string;
  balance: BigNumber;
  decimals?: string;
  symbol?: string;
  name?: string;
  type?: string;
}

interface MirrorNodeBalanceResponse {
  timestamp: string;
  balances: MirrorNodeAccountBalance[];
  links: MirrorNodeLinks;
}

interface MirrorNodeAccountBalance {
  account: string;
  balance: BigNumber;
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
  timestamp: string;
}

interface VotingInformation {
  abstainVotes: number;
  againstVotes: number;
  forVotes: number;
  hasVoted: boolean;
  isQuorumReached: boolean;
  isVoteSucceeded: boolean;
  proposalState: number;
  quorumValue: number;
}
interface ProposalCoreInputs {
  amountOrId: number;
  calldatas: string[];
  description: string;
  discussionLink: string;
  metadata: string;
  proposalType: GovernanceProposalType;
  targets: string[];
  title: string;
  _values: number[];
}
interface ProposalCoreInformation {
  blockedAmountOrId: number;
  createdAt: number;
  creator: string;
  inputs: ProposalCoreInputs;
  voteEnd: number;
  voteStart: number;
}
interface MirrorNodeDecodedProposalEvent {
  contractId: string;
  coreInformation: ProposalCoreInformation;
  proposalId: string;
  timestamp: string;
  votingInformation?: VotingInformation;
  votersList?: [
    voterInfo: {
      voter: string;
    }
  ];
  state: number;
}
interface MirrorNodeEventLog {
  address: string;
  bloom: string;
  contract_id: string;
  data: string;
  index: number;
  topics: string[];
  block_hash: string;
  block_number: number;
  root_contract_id: string;
  timestamp: string;
  transaction_hash: string;
  transaction_index: number;
}
interface MirrorNodeBlocks {
  number: number;
}
interface MirrorNodeTokenNFT {
  account_id: string;
  created_timestamp: string;
  delegating_spender: string;
  deleted: boolean;
  metadata: string;
  modified_timestamp: string;
  serial_number: number;
  spender_id: string;
  token_id: string;
}

interface MirrorNodeTokenNFTResponse {
  nfts: MirrorNodeTokenNFT[];
  links: MirrorNodeLinks;
}

/**
 * TODO: Refactor this to return a single MirrorNode type with other types as properties
 * i.e. MirrorNode.EventLog, MirrorNode.TokenByIdResponse, etc.
 */
export type {
  MirrorNodeEventLog,
  MirrorNodeTokenById,
  MirrorNodeTokenBalance,
  MirrorNodeTransaction,
  MirrorNodeBalanceResponse,
  MirrorNodeAccountBalance,
  MirrorNodeTokenTransfer,
  MirrorNodeProposalEventLog,
  MirrorNodeDecodedProposalEvent,
  MirrorNodeTokenPairResponse,
  MirrorNodeAccountById,
  MirrorNodeBlocks,
  MirrorNodeTokenNFT,
  MirrorNodeTokenNFTResponse,
  ProposalCoreInformation,
};
