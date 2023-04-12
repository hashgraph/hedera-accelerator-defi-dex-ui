import { useQuery } from "react-query";
import { DexService } from "../../services";
import { DAOQueries } from "./types";
import { DAO } from "../../services/DexService/dao";

type UseDAOsQueryKey = [DAOQueries.DAOs, string];

export function useDAOs(daoAccountId = "all") {
  return useQuery<DAO[], Error, DAO[], UseDAOsQueryKey>(
    [DAOQueries.DAOs, daoAccountId],
    async () => {
      return await DexService.fetchAllDAOs();
    },
    {
      select: (data: DAO[]) => {
        if (daoAccountId === "all") return data;
        return data.filter((dao) => dao.accountId === daoAccountId);
      },
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
