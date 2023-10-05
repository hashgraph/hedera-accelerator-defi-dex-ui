import { useQuery } from "react-query";
import { Contracts, DexService } from "@dex/services";
import { DAOQueries } from "./types";
import MultiSigDAOFactoryJSON from "../../dex/services/abi/MultiSigDAOFactory.json";
import FTDAOFactory from "../../dex/services/abi/FTDAOFactory.json";
import NFTDAOFactory from "../../dex/services/abi/NFTDAOFactory.json";
import { BigNumber, ethers } from "ethers";
import { DAOEvents } from "@dao/services";

export interface DAOConfigDetails {
  daoFee: number;
  daoTreasurer: string;
  tokenAddress: string;
}
export interface DAOConfig {
  multiSigDAOConfig: DAOConfigDetails;
  govDAOConfig: DAOConfigDetails;
  nftDAOConfig: DAOConfigDetails;
}

type UseContactQueryKey = [DAOQueries.Config];

export function useFetchDAOConfig() {
  function formatConfig(events: ethers.utils.LogDescription[]) {
    const latestConfig = events[0].args.daoConfig;
    const daoConfig: DAOConfigDetails = {
      daoFee: BigNumber.from(latestConfig.daoFee || 0).toNumber(),
      daoTreasurer: latestConfig.daoTreasurer,
      tokenAddress: latestConfig.tokenAddress,
    };
    return daoConfig;
  }

  return useQuery<DAOConfig, Error, DAOConfig, UseContactQueryKey>(
    [DAOQueries.Config],
    async () => {
      const multiSigDAOConfigLogs = await DexService.fetchParsedEventLogs(
        Contracts.MultiSigDAOFactory.ProxyId,
        new ethers.utils.Interface(MultiSigDAOFactoryJSON.abi),
        [DAOEvents.DAOConfig]
      );
      const govDAOConfigLogs = await DexService.fetchParsedEventLogs(
        Contracts.FTDAOFactory.ProxyId,
        new ethers.utils.Interface(FTDAOFactory.abi),
        [DAOEvents.DAOConfig]
      );
      const nftDAOConfigLogs = await DexService.fetchParsedEventLogs(
        Contracts.NFTDAOFactory.ProxyId,
        new ethers.utils.Interface(NFTDAOFactory.abi),
        [DAOEvents.DAOConfig]
      );
      return {
        multiSigDAOConfig: formatConfig(multiSigDAOConfigLogs),
        govDAOConfig: formatConfig(govDAOConfigLogs),
        nftDAOConfig: formatConfig(nftDAOConfigLogs),
      };
    },
    {
      staleTime: 10,
      keepPreviousData: true,
    }
  );
}
