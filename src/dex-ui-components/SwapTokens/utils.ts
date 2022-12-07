import { uniqBy } from "ramda";
import { NewTokenPairs, TokenPairs } from "../TokenInput";

/**
 * Returns half of the input amount.
 * @param amount - An amount of a tokens.
 * @returns Half of the input amount.
 */
export const halfOf = (amount: number) => amount / 2;

/**
 * Returns the amount of the paired token that is proportionally equal to the
 * token amount based on a given spot price.
 * @param tokenAmount - The amount of a token to exchanged
 * @param spotPrice - The exchange rate for 1 unit of tokenAmount.
 * @returns The amount of an other token that the tokenAmount could be exchanged for.
 */
export const getTokenExchangeAmount = (tokenAmount: number, spotPrice: number | undefined): number => {
  if (spotPrice !== undefined) {
    return Number((tokenAmount * spotPrice).toFixed(5));
  } else {
    console.warn("Spot Price is undefined");
    return 0;
  }
};

/**
 *
 * @param tokenPairs
 * @returns
 */
export const getTokensByUniqueAccountIds = (tokenPairs: NewTokenPairs[]): TokenPairs[] => {
  const tokens = tokenPairs.flatMap(({ tokenA, tokenB }: NewTokenPairs) => [tokenA, tokenB]);
  const uniqueTokens = uniqBy((token: TokenPairs) => token.tokenMeta.tokenId, tokens);
  return uniqueTokens;
};

/**
 * @param tokenId
 * @param tokenPairs
 */
export const getPairedTokens = (tokenId: string, tokenPairs: NewTokenPairs[]): TokenPairs[] => {
  const pairedTokens = tokenPairs.reduce<TokenPairs[]>((pairedTokens, tokenPair) => {
    const { tokenA, tokenB } = tokenPair;
    if (tokenA.tokenMeta.tokenId === tokenId) {
      return [tokenB, ...pairedTokens];
    }
    if (tokenB.tokenMeta.tokenId === tokenId) {
      return [tokenA, ...pairedTokens];
    }
    return pairedTokens;
  }, []);
  return pairedTokens;
};

export const getTokenMeta = (tokenSymbol: string, tokenPairs: NewTokenPairs[] = []) => {
  const filterToken = tokenPairs
    ?.map((token) => {
      if (token.tokenA.symbol === tokenSymbol) {
        return token.tokenA;
      } else if (token.tokenB.symbol === tokenSymbol) {
        return token.tokenB;
      }
      return undefined;
    })
    .filter((entry) => entry !== undefined)[0];
  return filterToken?.tokenMeta;
};
