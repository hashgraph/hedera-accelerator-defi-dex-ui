export const Paths = {
  Home: "/",
  Swap: {
    default: "swap",
  },
  Pools: {
    default: "pools",
    AddLiquidity: "pools/add-liquidity",
    Withdraw: "pools/withdraw",
    CreatePool: "pools/create-pool",
  },
  Governance: {
    absolute: "/governance",
    default: "governance",
    ProposalDetails: "governance/proposal-details",
    SelectProposalType: "governance/select-proposal-type",
    CreateNewToken: "governance/select-proposal-type/new-token",
    CreateText: "governance/select-proposal-type/text",
    CreateTokenTransfer: "governance/select-proposal-type/token-transfer",
    CreateContractUpgrade: "governance/select-proposal-type/contract-upgrade",
  },
  DAOs: {
    absolute: "/daos",
    default: "daos",
    Create: "create",
    DAODetails: "daos",
    TransactionDetails: "transactions",
  },
};
