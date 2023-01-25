import { TokenState } from "./types";

export const InitialTokenState: TokenState = {
  symbol: undefined,
  amount: 0,
  displayAmount: "",
  balance: undefined,
  poolLiquidity: undefined,
  tokenName: undefined,
  totalSupply: null,
  maxSupply: null,
  tokenMeta: {
    pairAccountId: undefined,
    tokenId: undefined,
  },
};
