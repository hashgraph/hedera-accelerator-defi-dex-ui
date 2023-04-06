import { DAOQueries, DAOMutations } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { useDexContext } from "../useDexContext";
import { DAOType } from "../../pages";
import { isNil } from "ramda";

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

interface UseCreateMultiSigDAOParams {
  admin: string;
  name: string;
  logoUrl: string;
  owners: string[];
  threshold: number;
  isPrivate: boolean;
}

type UseCreateDAOParams = (UseCreateGovernanceDAOParams | UseCreateMultiSigDAOParams) & {
  type: DAOType;
};

export function useCreateDAO(handleCreateDAOSuccess: (transactionResponse: TransactionResponse) => void) {
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
    },
    {
      onSuccess: (data: TransactionResponse | undefined) => {
        if (isNil(data)) return;
        queryClient.invalidateQueries(DAOQueries.FetchAllDAOs);
        handleCreateDAOSuccess(data);
      },
    }
  );
}
