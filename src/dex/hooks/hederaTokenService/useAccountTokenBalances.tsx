import { useQuery } from "react-query";
import { DexService, HBARTokenId, TokenType } from "../../services";
import { HTSQueries, TokenBalance } from "./types";
import { isEmpty, isNotNil } from "ramda";

type UseTokenBalancesKey = [HTSQueries.AccountTokenBalances, string];

type UseAccountTokenBalancesFilters = {
  textSearch?: string;
  tokenId?: string;
};

export function useAccountTokenBalances(accountId: string, filterBy?: UseAccountTokenBalancesFilters) {
  function filterBalances(tokenBalances: TokenBalance[]) {
    if (!filterBy) {
      return tokenBalances;
    }
    const { textSearch = "", tokenId: tokenIdFilter = "" } = filterBy;
    return tokenBalances.filter((tokenBalance: TokenBalance) => {
      const { name, symbol, tokenId } = tokenBalance;
      const searchString = `${name} ${symbol} ${tokenId}`.toLowerCase();
      const doesMatchSearchInput =
        isEmpty(textSearch) || (isNotNil(textSearch) && searchString.includes(textSearch.toLowerCase()));
      const doesMatchTokenId = isEmpty(tokenIdFilter) || (isNotNil(tokenIdFilter) && tokenId === tokenIdFilter);
      return doesMatchSearchInput && doesMatchTokenId;
    });
  }

  return useQuery<TokenBalance[], Error, TokenBalance[], UseTokenBalancesKey>(
    [HTSQueries.AccountTokenBalances, accountId],
    async () => {
      const accountBalances = await DexService.fetchAccountTokenBalances(accountId);
      const hbarBalance: TokenBalance = {
        name: "HBAR",
        symbol: "ℏ",
        decimals: "8",
        logo: "",
        tokenId: HBARTokenId,
        balance: accountBalances.balance.toNumber(),
        value: 0,
        type: TokenType.FT,
      };

      const { tokens = [] } = accountBalances;

      const tokenBalances = tokens.map((token): TokenBalance => {
        const { name = "", symbol = "", decimals = "", token_id = "", balance } = token;
        return {
          name,
          symbol,
          decimals,
          logo: "",
          tokenId: token_id ?? "",
          balance: balance.toNumber(),
          type: token.type ?? "",
          // TODO: Compute Fiat Value
          value: 0,
        };
      });

      return [hbarBalance].concat(tokenBalances);
    },
    {
      enabled: !!accountId,
      staleTime: 5,
      select: filterBalances,
      keepPreviousData: true,
    }
  );
}
