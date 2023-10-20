import { useQuery } from "react-query";
import { Contracts, DexService, HBARTokenId, convertEthersBigNumberToBigNumberJS } from "@dex/services";
import { TokenId } from "@hashgraph/sdk";
import { DAOConfig, DAOQueries } from "./types";
import MultiSigDAOFactoryJSON from "../../dex/services/abi/MultiSigDAOFactory.json";
import FTDAOFactory from "../../dex/services/abi/FTDAOFactory.json";
import NFTDAOFactory from "../../dex/services/abi/NFTDAOFactory.json";
import { ethers } from "ethers";
import { DAOEvents, TokenType } from "@dao/services";
import { isHbarToken } from "@dex/utils";

type UseContactQueryKey = [DAOQueries.Config];

export function useFetchDAOConfig() {
  async function formatConfig(events: ethers.utils.LogDescription[]) {
    const { amountOrId, receiver, tokenAddress } = events[0].args.feeConfig;
    const isHbar = isHbarToken(tokenAddress);
    const tokenId = TokenId.fromSolidityAddress(tokenAddress).toString();
    const {
      data: { symbol, decimals, token_id, type },
    } = await DexService.fetchTokenData(isHbar ? HBARTokenId : tokenId);
    return {
      daoFee: convertEthersBigNumberToBigNumberJS(amountOrId).toNumber(),
      preciseDAOFee: convertEthersBigNumberToBigNumberJS(amountOrId).shiftedBy(-Number(decimals)).toNumber(),
      daoTreasurer: receiver,
      tokenAddress: tokenAddress,
      symbol,
      tokenId: token_id,
      tokenType: isHbar ? TokenType.HBAR : type,
      decimals: Number(decimals),
    };
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
        multisigDAOFeeConfig: await formatConfig(multiSigDAOConfigLogs),
        ftDAOFeeConfig: await formatConfig(govDAOConfigLogs),
        nftDAOFeeConfig: await formatConfig(nftDAOConfigLogs),
      };
    },
    {
      staleTime: 10,
      keepPreviousData: true,
    }
  );
}
