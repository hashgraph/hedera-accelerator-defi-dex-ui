import { useQuery } from "react-query";
import {
  Contracts,
  DexService,
  HBARTokenId,
  HBARTokenSymbol,
  convertEthersBigNumberToBigNumberJS,
} from "@dex/services";
import { Hbar, HbarUnit, LedgerId, TokenId } from "@hashgraph/sdk";
import { DAOConfig, DAOQueries } from "./types";
import MultiSigDAOFactoryJSON from "../../dex/services/abi/MultiSigDAOFactory.json";
import FTDAOFactory from "../../dex/services/abi/FTDAOFactory.json";
import NFTDAOFactory from "../../dex/services/abi/NFTDAOFactory.json";
import { ethers } from "ethers";
import { DAOEvents, TokenType } from "@dao/services";
import { isHbarToken } from "@dex/utils";
import { getDefaultLedgerId } from "@shared/utils/utils";

type UseContactQueryKey = [DAOQueries.Config];

export function useFetchDAOConfig() {
  const HBAR_DECIMALS = 8;

  async function formatConfig(events: ethers.utils.LogDescription[]) {
    const { amountOrId, receiver, tokenAddress } = events[0].args.feeConfig;
    const isHbar = isHbarToken(tokenAddress);
    const amountAsBigNumber = convertEthersBigNumberToBigNumberJS(amountOrId);
    const tokenIdFromAddress = TokenId.fromSolidityAddress(tokenAddress).toString();

    if (isHbar) {
      const hbarAmount = Hbar.fromTinybars(amountOrId.toString());

      return {
        daoFee: Number(hbarAmount.toTinybars()),
        preciseDAOFee: Number(hbarAmount.to(HbarUnit.Hbar)),
        daoTreasurer: receiver,
        tokenAddress,
        symbol: HBARTokenSymbol,
        tokenId: getDefaultLedgerId() === LedgerId.MAINNET ? "0.0.0" : HBARTokenId,
        tokenType: TokenType.HBAR,
        decimals: HBAR_DECIMALS,
      };
    }

    const {
      data: { symbol, decimals, token_id, type },
    } = await DexService.fetchTokenData(tokenIdFromAddress);

    return {
      daoFee: amountAsBigNumber.toNumber(),
      preciseDAOFee: amountAsBigNumber.shiftedBy(-Number(decimals)).toNumber(),
      daoTreasurer: receiver,
      tokenAddress,
      symbol,
      tokenId: token_id,
      tokenType: type,
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
