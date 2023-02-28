import { useQuery } from "react-query";
import { DexService } from "../../services";
import { DAO, DAOQueries } from "./types";

export function useDAOs() {
  return useQuery<DAO[], Error, DAO[], DAOQueries.FetchAllDAOs>(
    DAOQueries.FetchAllDAOs,
    async () => {
      return DexService.fetchAllDAOs();
    },
    {
      staleTime: 10,
      keepPreviousData: true,
    }
  );
}
