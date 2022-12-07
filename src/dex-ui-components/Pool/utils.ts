import { TokenPair } from "../TokenInput";

/**
 * @param tokenId
 * @param tokenPairs
 */
export const getLPTokens = (tokenPairs: TokenPair[]): any[] => {
  return tokenPairs.map((tokenPair) => tokenPair.pairToken);
};
