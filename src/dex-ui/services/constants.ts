import contractsUAT from "./contractsUAT.json";

interface ContractMetaData {
  name: string;
  id: string;
  address: string;
  timestamp: string;
  hash: string;
  transparentProxyAddress: string;
  transparentProxyId: string;
}

enum ContractNames {
  Factory = "factory",
  GodHolder = "godholder",
  Value = "vault",
  Splitter = "splitter",
  Pair = "pair",
  LPToken = "lptoken",
  GovernorContractUpgrade = "governorupgrade",
  GovernorTransferToken = "governortransfertoken",
  GovernorTextProposal = "governortextproposal",
  GovernorCreateToken = "governortokencreate",
  Configuration = "configuration",
  GodTokenHolderFactory = "godtokenholderfactory",
  GovernanceDAOFactory = "governancedaofactory",
  MultiSigDAOFactory = "multisigdaofactory",
}

function getProxyId(contractName: ContractNames): string {
  return contractsUAT.find((contract: ContractMetaData) => contract.name === contractName)?.transparentProxyId ?? "";
}

export const Contracts = {
  Factory: {
    ProxyId: getProxyId(ContractNames.Factory),
  },
  Governor: {
    ContractUpgrade: {
      ProxyId: getProxyId(ContractNames.GovernorContractUpgrade),
    },
    TransferToken: {
      ProxyId: getProxyId(ContractNames.GovernorTransferToken),
    },
    TextProposal: {
      ProxyId: getProxyId(ContractNames.GovernorTextProposal),
    },
    CreateToken: {
      ProxyId: getProxyId(ContractNames.GovernorCreateToken),
    },
  },
  GovernanceDAOFactory: {
    ProxyId: getProxyId(ContractNames.GovernanceDAOFactory),
  },
  GODHolder: {
    ProxyId: getProxyId(ContractNames.GodHolder),
  },
  Configuration: {
    ProxyId: getProxyId(ContractNames.Configuration),
  },
  MultiSigDAOFactory: {
    ProxyId: getProxyId(ContractNames.MultiSigDAOFactory),
  },
};

/** The "hashconnectData" is the string used by the hashconnect lib to modify localStorage */
export const WALLET_LOCAL_DATA_KEY = "hashconnectData";

export const ADMIN_ID = "0.0.6948";

export const ADMIN_KEY = "c8cb72a0addffcbd898689e5b5641c0abff4399ddeb90a04071433e3724e14dd";

export const TREASURY_ID = "0.0.6880";

export const TREASURY_KEY = "c372f05c182ae62e04603081f6abc8cbd3a712401e1d1f88401cf310c91f644b";

export const TOKEN_USER_PUB_KEY = "0c3e3513cae184f966ea3b65c47bd02c4228dcc5cde25a66a7b970c202bb20e7";

export const TOKEN_USER_ID = "0.0.8255";

export const TOKEN_USER_KEY = "0bf5b9ac3f3066f6046a778409891e9f2081c349b4cf8688d29023312cc2d632";

export const DEX_TOKEN_PRECISION_VALUE = 8;
export const DEX_PRECISION = 100000000;

export const Tokens = Object.freeze({
  TokenASymbol: "LAB49A",
  TokenAAccountId: "0.0.8579",
  TokenBSymbol: "LAB49B",
  TokenBAccountId: "0.0.8581",
  TokenCSymbol: "LAB49C",
  TokenCAccountId: "0.0.8583",
  TokenDSymbol: "LAB49D",
  TokenDAccountId: "0.0.7155",
});

export const PAIR_TOKEN_SYMBOL = "L49";
export const A_B_PAIR_TOKEN_ID = "0.0.48769790";

export const USDC_TOKEN_ID = "0.0.2276691";

export const GovernanceTokenId = "0.0.8576";
export const HBARTokenId = "0.0.8578";
export const HBARTokenSymbol = "HBAR";

export const TOKEN_SYMBOL_TO_ACCOUNT_ID = new Map<string, string>([
  [Tokens.TokenASymbol, Tokens.TokenAAccountId],
  [Tokens.TokenBSymbol, Tokens.TokenBAccountId],
  [Tokens.TokenCSymbol, Tokens.TokenCAccountId],
  [Tokens.TokenDSymbol, Tokens.TokenDAccountId],
  [PAIR_TOKEN_SYMBOL, A_B_PAIR_TOKEN_ID],
]);

export const TOKEN_ID_TO_TOKEN_SYMBOL = new Map<string, string>([
  [Tokens.TokenAAccountId, Tokens.TokenASymbol],
  [Tokens.TokenBAccountId, Tokens.TokenBSymbol],
  [Tokens.TokenCAccountId, Tokens.TokenCSymbol],
  [Tokens.TokenDAccountId, Tokens.TokenDSymbol],
  [A_B_PAIR_TOKEN_ID, PAIR_TOKEN_SYMBOL],
]);
