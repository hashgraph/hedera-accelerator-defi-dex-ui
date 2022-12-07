interface TokenPairs {
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairContractId: string | undefined;
    tokenId: string | undefined;
  };
}

interface NewTokenPairs {
  tokenA: TokenPairs;
  tokenB: TokenPairs;
  pairToken: {
    symbol: string | undefined;
    accountId: string | undefined;
  };
}

export type { TokenPairs, NewTokenPairs };
