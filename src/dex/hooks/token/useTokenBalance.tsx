import { TokenQueries } from "./types";
import { useQuery } from "react-query";
import { DexService } from "@dex/services";
import { AccountBalanceJson } from "@hashgraph/sdk";
import { useDexContext } from "..";
import { isNil } from "ramda";

interface UseTokenBalanceProps {
  tokenId: string | undefined;
  handleTokenBalanceSuccessResponse?: (data: number | undefined) => void;
  handleTokenBalanceErrorResponse?: () => void;
}

type UseTokenBalanceQueryKey = [TokenQueries.TokenBalance, string | undefined];

export function useTokenBalance(props: UseTokenBalanceProps) {
  const { tokenId, handleTokenBalanceSuccessResponse, handleTokenBalanceErrorResponse } = props;
  const { wallet } = useDexContext(({ wallet, context }) => ({ wallet, context }));
  const accountId = wallet.savedPairingData?.accountIds[0] ?? "";

  return useQuery<AccountBalanceJson | undefined, Error, number | undefined, UseTokenBalanceQueryKey>(
    [TokenQueries.TokenBalance, accountId],
    async () => {
      return accountId ? DexService.getAccountBalance(accountId) : undefined;
    },
    {
      select: (data) => {
        const token = data?.tokens.find((token: { tokenId: string }) => token.tokenId === tokenId);

        if (isNil(token)) return undefined;

        return Number(token.balance);
      },
      enabled: !!(accountId && tokenId),
      onSuccess: (data) => {
        if (handleTokenBalanceSuccessResponse) return handleTokenBalanceSuccessResponse(data);
      },
      onError: () => {
        if (handleTokenBalanceErrorResponse) return handleTokenBalanceErrorResponse();
      },
    }
  );
}
