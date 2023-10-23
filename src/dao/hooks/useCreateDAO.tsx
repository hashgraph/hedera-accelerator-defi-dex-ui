import { DAOQueries, DAOMutations, DAOConfigDetails } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "@dex/services";
import { DAOType } from "@dao/services";
import { HandleOnSuccess, useDexContext } from "@dex/hooks";
import { isNil } from "ramda";

interface UseCreateDAOParamsBase {
  name: string;
  description: string;
  daoLinks: string[];
  logoUrl: string;
  isPrivate: boolean;
  infoUrl: string;
}

interface UseCreateGovernanceDAOParams extends UseCreateDAOParamsBase {
  treasuryWalletAccountId: string;
  tokenId: string;
  quorum: number;
  votingDuration: number;
  lockingDuration: number;
  daoFeeConfig: DAOConfigDetails | undefined;
}

interface UseCreateNFTDAOParams extends UseCreateDAOParamsBase {
  treasuryWalletAccountId: string;
  tokenId: string;
  quorum: number;
  votingDuration: number;
  lockingDuration: number;
  daoFeeConfig: DAOConfigDetails | undefined;
}

interface UseCreateMultiSigDAOParams extends UseCreateDAOParamsBase {
  admin: string;
  owners: string[];
  threshold: number;
  daoFeeConfig: DAOConfigDetails | undefined;
}

type UseCreateDAOParams = (UseCreateGovernanceDAOParams | UseCreateMultiSigDAOParams | UseCreateNFTDAOParams) & {
  type: DAOType;
};

export function useCreateDAO(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse | undefined, Error, UseCreateDAOParams, DAOMutations.CreateDAO>(
    async (params: UseCreateDAOParams) => {
      const { type, daoFeeConfig, ...data } = params;
      if (isNil(daoFeeConfig)) return;
      if (type === DAOType.GovernanceToken) {
        const governanceDAOData = data as UseCreateGovernanceDAOParams;
        return DexService.sendCreateGovernanceDAOTransaction({ ...governanceDAOData, signer, daoFeeConfig });
      }
      if (type === DAOType.MultiSig) {
        const multiSigDAOData = data as UseCreateMultiSigDAOParams;
        return DexService.sendCreateMultiSigDAOTransaction({ ...multiSigDAOData, signer, daoFeeConfig });
      }
      if (type === DAOType.NFT) {
        const nftDAOData = data as UseCreateNFTDAOParams;
        return DexService.sendCreateNFTDAOTransaction({ ...nftDAOData, signer, daoFeeConfig });
      }
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries(DAOQueries.DAOs);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
