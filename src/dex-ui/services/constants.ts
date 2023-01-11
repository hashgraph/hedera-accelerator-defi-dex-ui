import { ContractId } from "@hashgraph/sdk";

/** The "hashconnectData" is the string used by the hashconnect lib to modify localStorage */
export const WALLET_LOCAL_DATA_KEY = "hashconnectData";

export const ADMIN_ID = "0.0.47710057";

export const ADMIN_KEY =
  "3030020100300706052b8104000a04220420d38b0ed5f11f8985cd72c8e52c206b512541c6f301ddc9d18bd8b8b25a41a80f";

export const TREASURY_ID = "0.0.47645191";

export const TREASURY_KEY = "308ed38983d9d20216d00371e174fe2d475dd32ac1450ffe2edfaab782b32fc5";

export const TOKEN_USER_PUB_KEY = "3e0f62c7c812d0c9d1d045c4efb70369d69549914455370adab22207ec37d967";

export const CONTRACT_NAME = "governorcountingsimpleinternal";

export const TOKEN_USER_ID = "0.0.47540202";

export const TOKEN_USER_KEY =
  "302e020100300506032b657004220420b69079b0cdebea97ec13c78bf7277d3f4aef35189755b5d11c2dfae40c566aa8";

// Factory Contract Proxy
export const FACTORY_CONTRACT_ID = "0.0.49271021";
// Swap Contract (Pair) Proxy
export const SWAP_CONTRACT_ID = "0.0.48660596";

export const Tokens = Object.freeze({
  TokenASymbol: "L49A",
  TokenAAccountId: "0.0.48289687",
  TokenBSymbol: "L49B",
  TokenBAccountId: "0.0.48289686",
  TokenCSymbol: "L49C",
  TokenCAccountId: "0.0.48301281",
  TokenDSymbol: "L49D",
  TokenDAccountId: "0.0.48301282",
});

export const A_TO_B = `${Tokens.TokenASymbol}=>${Tokens.TokenBSymbol}`;
export const B_TO_A = `${Tokens.TokenBSymbol}=>${Tokens.TokenASymbol}`;

export const PAIR_TOKEN_SYMBOL = "L49";
export const A_B_PAIR_TOKEN_ID = "0.0.48769790";

export const USDC_TOKEN_ID = "0.0.2276691";

export const GovernorProxyContracts = Object.freeze({
  ContractUpgradeStringId: "0.0.49180576",
  ContractUpgradeContractId: ContractId.fromString("0.0.49180576"),
  TransferTokenStringId: "0.0.49180063",
  TransferTokenContractId: ContractId.fromString("0.0.49180063"),
  TextProposalStringId: "0.0.49176059",
  TextProposalContractId: ContractId.fromString("0.0.49176059"),
  CreateTokenStringId: "0.0.49057304",
  CreateTokenContractId: ContractId.fromString("0.0.49057304"),
});

export const GovernanceTokenId = "0.0.48602639";

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
