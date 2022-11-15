import { ContractId } from "@hashgraph/sdk";

/** The "hashconnectData" is the string used by the hashconnect lib to modify localStorage */
export const WALLET_LOCAL_DATA_KEY = "hashconnectData";

export const ADMIN_ID = "0.0.47710057";

export const ADMIN_KEY =
  "3030020100300706052b8104000a04220420d38b0ed5f11f8985cd72c8e52c206b512541c6f301ddc9d18bd8b8b25a41a80f";

export const TREASURY_ID = "0.0.47645191";

export const TREASURY_KEY = "308ed38983d9d20216d00371e174fe2d475dd32ac1450ffe2edfaab782b32fc5";

export const CONTRACT_NAME = "governorcountingsimpleinternal";

export const TOKEN_USER_ID = "0.0.47540202";

export const TOKEN_USER_KEY =
  "302e020100300506032b657004220420b69079b0cdebea97ec13c78bf7277d3f4aef35189755b5d11c2dfae40c566aa8";

// Swap Contract (Pair) Proxy
export const SWAP_CONTRACT_ID = "0.0.48660596";

export const TOKEN_A_SYMBOL = "Token SymbolA0";
export const TOKEN_A_ID = "0.0.48660644";

export const TOKEN_B_SYMBOL = "Token SymbolB0";
export const TOKEN_B_ID = "0.0.48660646";

export const A_TO_B = `${TOKEN_A_SYMBOL}=>${TOKEN_B_SYMBOL}`;
export const B_TO_A = `${TOKEN_B_SYMBOL}=>${TOKEN_A_SYMBOL}`;

export const PAIR_TOKEN_SYMBOL = "L49";
export const A_B_PAIR_TOKEN_ID = "0.0.48769790";

export const USDC_TOKEN_ID = "0.0.2276691";

export const GOVERNOR_PROXY_CONTRACT = {
  StringId: "0.0.48954588",
  ContractId: ContractId.fromString("0.0.48954588"),
};

export const TOKEN_SYMBOL_TO_ACCOUNT_ID = new Map<string, string>([
  [TOKEN_A_SYMBOL, TOKEN_A_ID],
  [TOKEN_B_SYMBOL, TOKEN_B_ID],
  [PAIR_TOKEN_SYMBOL, A_B_PAIR_TOKEN_ID],
]);

export const TOKEN_ID_TO_TOKEN_SYMBOL = new Map<string, string>([
  [TOKEN_A_ID, TOKEN_A_SYMBOL],
  [TOKEN_B_ID, TOKEN_B_SYMBOL],
  [A_B_PAIR_TOKEN_ID, PAIR_TOKEN_SYMBOL],
]);
