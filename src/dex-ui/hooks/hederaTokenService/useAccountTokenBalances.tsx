import { useQuery } from "react-query";
import { DexService } from "../../services";
import { HTSQueries } from "./types";

export interface TokenBalance {
  name: string;
  symbol: string;
  decimals: string;
  logo: string;
  tokenId: string;
  balance: number;
  value: number;
}

type UseTokenBalancesKey = [HTSQueries.AccountTokenBalances, string];

export function useAccountTokenBalances(accountId: string) {
  return useQuery<TokenBalance[], Error, TokenBalance[], UseTokenBalancesKey>(
    [HTSQueries.AccountTokenBalances, accountId],
    async () => {
      const accountBalances = await DexService.fetchAccountTokenBalances(accountId);
      const hbarBalance: TokenBalance = {
        name: "HBAR",
        symbol: "ℏ",
        decimals: "8",
        logo: "",
        tokenId: "",
        balance: accountBalances.balance.toNumber(),
        value: 0,
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
          // TODO: Compute Fiat Value
          value: 0,
        };
      });

      return [hbarBalance].concat(tokenBalances);
    },
    {
      enabled: !!accountId,
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
