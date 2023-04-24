import { TokenQueries } from "./types";
import { useQuery } from "react-query";
import { DexService } from "../../services";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { useDexContext } from "..";
import { getFormattedTokenBalances } from "../../store/walletSlice/utils";
import { isNil } from "ramda";

interface UseTokenBalanceProps {
  tokenId: string;
}

type UseTokenBalanceQueryKey = [TokenQueries.TokenBalance, string | undefined];

export function useTokenBalance(props: UseTokenBalanceProps) {
  const { tokenId } = props;
  const { context, wallet } = useDexContext(({ wallet, context }) => ({ wallet, context }));
  const accountId = wallet.savedPairingData?.accountIds[0];
  const provider = DexService.getProvider(context.network, wallet.topicID, accountId ?? "");

  return useQuery<AccountBalanceJson | undefined, Error, number, UseTokenBalanceQueryKey>(
    [TokenQueries.TokenBalance, accountId],
    async () => {
      return DexService.getAccountBalance(provider, wallet.savedPairingData?.accountIds[0] ?? "");
    },
    {
      select: (data) => {
        const token = data?.tokens.find((token) => token.tokenId === tokenId);
        if (isNil(token)) return 0;
        const formattedTokenBalance = getFormattedTokenBalances([token]);
        return Number(formattedTokenBalance.find((token) => token.tokenId === tokenId)?.balance ?? 0);
      },
      enabled: !!accountId,
    }
  );
}
