import BigNumber from "bignumber.js";
import Long from "long";

export const SELECT_TOKEN_TO_VIEW = "Select Token To View";
export const CONNECT_TO_VIEW = "Connect to View";

interface Token {
  symbol: string | undefined;
  tokenName: string | undefined;
  totalSupply: Long | null;
  maxSupply: Long | null;
  tokenMeta: {
    pairAccountId: string | undefined;
    tokenId: string | undefined;
    fee: BigNumber | undefined;
    lpTokenId: string | undefined;
  };
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

export type { TokenPair, Token };
