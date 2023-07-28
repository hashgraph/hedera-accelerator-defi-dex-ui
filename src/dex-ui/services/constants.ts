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
  GovernorContractUpgrade = "governorupgrade",
  GovernorTransferToken = "governortransfertoken",
  GovernorTextProposal = "governortextproposal",
  GovernorCreateToken = "governortokencreate",
  Configuration = "configuration",
  FTDAOFactory = "ftdaofactory",
  MultiSigDAOFactory = "multisigdaofactory",
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
  NFTDAOFactory: {
    ProxyId: getProxyId(ContractNames.NFTDAOFactory),
  },
};

/** The "hashconnectData" is the string used by the hashconnect lib to modify localStorage */
export const WALLET_LOCAL_DATA_KEY = "hashconnectData";

export const TREASURY_ID = "0.0.78619";
export const TREASURY_KEY =
  "302e020100300506032b657004220420c8cb72a0addffcbd898689e5b5641c0abff4399ddeb90a04071433e3724e14dd";

export const TOKEN_USER_ID = "0.0.65816";
export const TOKEN_USER_KEY =
  "302e020100300506032b657004220420899ec4fb7e8153a36bd37dd9500b9057982bf76bc1f0efa5b8cb170ee2329997";

export const DEX_TOKEN_PRECISION_VALUE = 8;
export const DEX_PRECISION = 100000000;
export const DEBOUNCE_TIME = 500;
export const EDITOR_DEFAULT_CHARACTER_COUNT = 7;

export const Tokens = Object.freeze({
  TokenASymbol: "LAB49A",
  TokenAAccountId: "0.0.80170",
  TokenBSymbol: "LAB49B",
  TokenBAccountId: "0.0.80174",
  TokenCSymbol: "LAB49C",
  TokenCAccountId: "0.0.80180",
});

export const USDC_TOKEN_ID = "0.0.2276691";

export const GovernanceTokenId = "0.0.80158";

export const HBARTokenId = "0.0.80165";
export const HBARTokenSymbol = "HBAR";
export const HBARSymbol = "ℏ";
export const SENTINEL_OWNER = "0.0.1";
export const DEFAULT_NFT_TOKEN_SERIAL_ID = 19;
export const MINIMUM_DEPOSIT_AMOUNT = 1;

export const Gas = 9000000;
