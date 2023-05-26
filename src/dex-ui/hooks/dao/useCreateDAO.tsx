import { DAOQueries, DAOMutations } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService, DAOType } from "../../services";
import { useDexContext } from "../useDexContext";
import { isNil } from "ramda";
import { HandleOnSuccess } from "@hooks";

interface UseCreateGovernanceDAOParams {
  name: string;
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
        queryClient.invalidateQueries(DAOQueries.DAOs);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
