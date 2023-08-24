import { useQuery } from "react-query";
import { DexService, HBARTokenId, TokenType, DEX_TOKEN_PRECISION_VALUE } from "../../services";
import { HTSQueries } from "./types";
import { isEmpty, isNotNil } from "ramda";
import { TokenBalance } from "./types";

type UseAccountTokenBalancesKey = [HTSQueries.AccountsTokenBalances, string];

type UseAccountTokenBalancesFilters = {
  textSearch?: string;
  tokenId?: string;
};

export function useMultipleAccountTokenBalances(accountIds: string[], filterBy?: UseAccountTokenBalancesFilters) {
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

  const uniqueAccountId = accountIds.join("");

  return useQuery<TokenBalance[], Error, TokenBalance[], UseAccountTokenBalancesKey>(
    [HTSQueries.AccountsTokenBalances, uniqueAccountId],
    async () => {
      const urlRequest = accountIds?.map((accountId) => DexService.fetchAccountTokenBalances(accountId)) ?? [];
      const accountBalances = await Promise.all(urlRequest);
      const hBARBalance = accountBalances.reduce((sum, token) => {
        return sum + token.balance.toNumber();
      }, 0);
      const hbarBalance: TokenBalance = {
        name: "HBAR",
        symbol: "ℏ",
        decimals: "8",
        logo: "",
        tokenId: HBARTokenId,
        balance: hBARBalance,
        type: TokenType.FT,
        value: 0,
      };

      const tokenBalances = accountBalances
        .flatMap((account) => account.tokens)
        .reduce((tokens: TokenBalance[], token) => {
          const tokenObj = tokens.find((obj) => obj?.symbol === token.symbol);
          if (!tokenObj) {
            tokens.push({
              name: token?.name ?? "",
              symbol: token?.symbol ?? "",
              decimals: token?.decimals ?? `${DEX_TOKEN_PRECISION_VALUE}`,
              logo: "",
              tokenId: token.token_id,
              balance: token.balance.toNumber(),
              type: token.type ?? "",
              // TODO: Compute Fiat Value
              value: 0,
            });
          } else {
            tokenObj.balance += token.balance.toNumber();
          }
          return tokens;
        }, []);
      return [hbarBalance].concat(tokenBalances);
    },
    {
      enabled: !!uniqueAccountId,
      staleTime: 5,
      select: filterBalances,
      keepPreviousData: true,
    }
  );
}
