import { useQuery } from "react-query";
import { DexService, MirrorNodeTokenPairResponse } from "@dex/services";
import { DAOQueries } from "./types";

type UseContactQueryKey = [DAOQueries.Contract, string];

export function useFetchContract(address: string) {
  return useQuery<MirrorNodeTokenPairResponse, Error, MirrorNodeTokenPairResponse, UseContactQueryKey>(
    [DAOQueries.Contract, address],
    async () => {
      return await DexService.fetchContract(address);
    },
    {
      enabled: !!address,
      staleTime: Infinity,
      keepPreviousData: true,
    }
  );
}
