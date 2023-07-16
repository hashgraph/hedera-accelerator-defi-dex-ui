import contractsUAT from "./contractsUAT.json";

interface ContractMetaData {
  name: string;
  id: string;
  address: string;
  timestamp: string;
  hash: string;
  transparentProxyAddress?: string;
  transparentProxyId?: string;
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
  FTDAOFactory = "ftdaofactory",
  MultiSigDAOFactory = "multisigdaofactory",
  MultiSigDAO = "multisigdao",
  NFTDAOFactory = "nftdaofactory",
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
  FTDAOFactory: {
    ProxyId: getProxyId(ContractNames.FTDAOFactory),
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
  MultiSigDAO: {
    ProxyId: getProxyId(ContractNames.MultiSigDAO),
  },
  NFTDAOFactory: {
    ProxyId: getProxyId(ContractNames.NFTDAOFactory),
  },
};

/** The "hashconnectData" is the string used by the hashconnect lib to modify localStorage */
export const WALLET_LOCAL_DATA_KEY = "hashconnectData";

export const TREASURY_ID = "0.0.6880";
export const TREASURY_KEY = "c372f05c182ae62e04603081f6abc8cbd3a712401e1d1f88401cf310c91f644b";

export const TOKEN_USER_ID = "0.0.8255";
export const TOKEN_USER_KEY = "0bf5b9ac3f3066f6046a778409891e9f2081c349b4cf8688d29023312cc2d632";

export const DEX_TOKEN_PRECISION_VALUE = 8;
export const DEX_PRECISION = 100000000;
export const DEBOUNCE_TIME = 500;

export const Tokens = Object.freeze({
  TokenASymbol: "LAB49A",
  TokenAAccountId: "0.0.8579",
  TokenBSymbol: "LAB49B",
  TokenBAccountId: "0.0.8581",
  TokenCSymbol: "LAB49C",
  TokenCAccountId: "0.0.8583",
});

export const USDC_TOKEN_ID = "0.0.2276691";

export const GovernanceTokenId = "0.0.8576";

export const HBARTokenId = "0.0.8578";
export const HBARTokenSymbol = "HBAR";
export const SENTINEL_OWNER = "0.0.1";
export const DEFAULT_NFT_TOKEN_SERIAL_ID = 19;

export const Gas = 9000000;
