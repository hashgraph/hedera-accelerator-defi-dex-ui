import { getDefaultLedgerId } from "shared";
import contractsUAT from "./contractsUAT.json";
import contractsMainnet from "./contractsMainnet.json";

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
  SystemRoleBasedAccess = "systemrolebasedaccess",
}

function getProxyId(contractName: ContractNames): string {
  const activeNetwork = getDefaultLedgerId();

  return (
    (activeNetwork.toString() === "mainnet" ? contractsMainnet : contractsUAT).find(
      (contract: ContractMetaData) => contract.name === contractName
    )?.transparentProxyId ?? ""
  );
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
  SystemRoleBasedAccess: {
    ProxyId: getProxyId(ContractNames.SystemRoleBasedAccess),
  },
};

/** The "hashconnectData" is the string used by the hashconnect lib to modify localStorage */
export const WALLET_LOCAL_DATA_KEY = "hashconnectData";

export const TREASURY_ID = "0.0.2948681";
export const TREASURY_KEY =
  "3030020100300706052b8104000a04220420d750ddaf60e3089c856c5b9f7592483aeb3bf62f514a90e27c64e3aced6a3232";

export const TOKEN_USER_ID = "0.0.3418035";
export const TOKEN_USER_KEY =
  "302e020100300506032b657004220420899ec4fb7e8153a36bd37dd9500b9057982bf76bc1f0efa5b8cb170ee2329997";

export const DEX_TOKEN_PRECISION_VALUE = 8;
export const DEBOUNCE_TIME = 500;
export const EDITOR_DEFAULT_CHARACTER_COUNT = 7;

export const Tokens = Object.freeze({
  TokenASymbol: "LAB49A",
  TokenAAccountId: "0.0.3418198",
  TokenBSymbol: "LAB49B",
  TokenBAccountId: "0.0.3418199",
  TokenCSymbol: "LAB49C",
  TokenCAccountId: "0.0.3418200",
});

export const USDC_TOKEN_ID = "0.0.2276691";

export const GovernanceTokenId = "0.0.3418196";

export const HBARTokenId = "0.0.3418197";
export const HBARTokenAddress = "0.0.0";
export const HBARTokenSymbol = "HBAR";
export const HBARSymbol = "ℏ";
export const SENTINEL_OWNER = "0.0.1";
export const DEFAULT_NFT_TOKEN_SERIAL_ID = 0;
export const MINIMUM_DEPOSIT_AMOUNT = 1;

export const Gas = 9000000;
export const GasPrice = 100000000;

export const DAOsPerPage = 30;
