import { useQuery } from "react-query";
import daoSDK, { DAO } from "@dao/services";
import { DAOQueries } from "./types";

type UseDAOsQueryKey = [DAOQueries.DAOs];

export function useDAOs<DAOType extends DAO>() {
  return useQuery<DAOType[], Error, DAOType[], UseDAOsQueryKey>(
    [DAOQueries.DAOs],
    async () => {
      return (await daoSDK.fetchAllDAOs()) as DAOType[];
    },
    {
      staleTime: 5,
      keepPreviousData: true,
    }
  );
}
