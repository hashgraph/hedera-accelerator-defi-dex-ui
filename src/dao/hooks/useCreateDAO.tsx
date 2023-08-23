import { DAOQueries, DAOMutations } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DexService } from "@dex/services";
import { DAOType } from "@dao/services";
import { HandleOnSuccess, useDexContext } from "@dex/hooks";
import { isNil } from "ramda";

interface UseCreateGovernanceDAOParams {
  name: string;
  description: string;
  daoLinks: string[];
  logoUrl: string;
  isPrivate: boolean;
  treasuryWalletAccountId: string;
  tokenId: string;
  quorum: number;
  votingDuration: number;
  lockingDuration: number;
}

interface UseCreateNFTDAOParams {
  name: string;
  logoUrl: string;
  description: string;
  daoLinks: string[];
  isPrivate: boolean;
  treasuryWalletAccountId: string;
  tokenId: string;
  quorum: number;
  votingDuration: number;
  lockingDuration: number;
}

interface UseCreateMultiSigDAOParams {
  admin: string;
  name: string;
  description: string;
  daoLinks: string[];
  logoUrl: string;
  owners: string[];
  threshold: number;
  isPrivate: boolean;
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
      const { type, ...data } = params;
      if (type === DAOType.GovernanceToken) {
        const governanceDAOData = data as UseCreateGovernanceDAOParams;
        return DexService.sendCreateGovernanceDAOTransaction({ ...governanceDAOData, signer });
      }
      if (type === DAOType.MultiSig) {
        const multiSigDAOData = data as UseCreateMultiSigDAOParams;
        return DexService.sendCreateMultiSigDAOTransaction({ ...multiSigDAOData, signer });
      }
      if (type === DAOType.NFT) {
        const nftDAOData = data as UseCreateNFTDAOParams;
        return DexService.sendCreateNFTDAOTransaction({ ...nftDAOData, signer });
      }
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
