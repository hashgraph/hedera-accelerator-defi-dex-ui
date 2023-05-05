import { useQuery } from "react-query";
import { DexService } from "../../services";
import { DAOQueries } from "./types";
import { DAO } from "../../services/DexService/dao";

type UseDAOsQueryKey = [DAOQueries.DAOs, string];

export function useDAOs<DAOType extends DAO>(daoAccountId = "all") {
  return useQuery<DAOType[], Error, DAOType[], UseDAOsQueryKey>(
    [DAOQueries.DAOs, daoAccountId],
    async () => {
      return (await DexService.fetchAllDAOs()) as DAOType[];
    },
    {
      enabled: !!daoAccountId,
      select: (data: DAOType[]) => {
        if (daoAccountId === "all") return data;
        return data.filter((dao) => dao.accountId === daoAccountId);
      },
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
