enum GovernorContractFunctions {
  CreateProposal = "createProposal",
  CastVote = "castVote",
  ExecuteProposal = "executeProposal",
  ClaimGODToken = "claimGODToken",
  DeployABIFile = "deployABIFile",
  CancelProposal = "cancelProposal",
}

enum PairContractFunctions {
  SwapToken = "swapToken",
  RemoveLiquidity = "removeLiquidity",
}

interface TokenPair {
  tokenA: Token;
  tokenB: Token;
  pairToken: {
    symbol: string | undefined;
    pairLpAccountId: string | undefined;
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
    tokenId: string | undefined;
  };
}

export { GovernorContractFunctions, PairContractFunctions };
export type { TokenPair, Token };
