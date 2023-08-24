import Long from "long";

enum GovernorContractFunctions {
  CreateProposal = "createProposal",
  CastVotePublic = "castVotePublic",
  ExecuteProposal = "executeProposal",
  ClaimGODToken = "claimGODToken",
  DeployABIFile = "deployABIFile",
  CancelProposal = "cancelProposal",
  LockGODToken = "grabTokensFromUser",
  UnLockGODToken = "revertTokensForVoter",
}

enum PairContractFunctions {
  SwapToken = "swapToken",
  RemoveLiquidity = "removeLiquidity",
  CreatePair = "createPair",
}

interface TokenPair {
  tokenA: Token;
  tokenB: Token;
  lpTokenMeta: {
    symbol: string | undefined;
    lpAccountId: string | undefined;
    totalSupply?: Long | null;
    decimals: number;
  };
}
interface Token {
  amount: number;
  displayAmount: string;
  balance: number | undefined;
  poolLiquidity: number | undefined;
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairAccountId: string | undefined;
    lpTokenId: string | undefined;
    tokenId: string | undefined;
  };
}

export { GovernorContractFunctions, PairContractFunctions };
export type { TokenPair, Token };
