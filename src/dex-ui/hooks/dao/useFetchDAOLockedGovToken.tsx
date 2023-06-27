import { convertEthersBigNumberToBigNumberJS, DexService, DEX_TOKEN_PRECISION_VALUE } from "@services";
import { useQuery } from "react-query";
import { isNil } from "ramda";
import { DAOQueries } from "./types";

type UseFetchGODTokenQueryKey = [DAOQueries.GodTokens, string | undefined, string | undefined];

export function useFetchDAOLockedGovToken(tokenHolderAddress: string, walletId: string) {
  return useQuery<number | undefined, Error, number, UseFetchGODTokenQueryKey>(
    [DAOQueries.GodTokens, tokenHolderAddress, walletId],
    async () => {
      if (isNil(tokenHolderAddress)) return;
      const balance = await DexService.fetchUpgradeContractEvents(tokenHolderAddress, walletId);
      return balance
        ? convertEthersBigNumberToBigNumberJS(balance)?.shiftedBy(-DEX_TOKEN_PRECISION_VALUE).toNumber()
        : 0;
    },
    {
      enabled: !!(tokenHolderAddress && walletId),
    }
  );
}
