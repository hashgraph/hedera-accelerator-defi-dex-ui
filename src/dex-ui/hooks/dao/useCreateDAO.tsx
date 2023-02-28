import { DAOQueries, DAOMutations } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { useDexContext } from "../useDexContext";

interface UseCreateDAOParams {
  name: string;
  logoUrl: string;
  isPrivate: boolean;
  treasuryWalletAccountId: string;
  tokenId: string;
  quorum: number;
  votingDuration: number;
  lockingDuration: number;
}

export function useCreateDAO(handleCreateDAOSuccess: (transactionResponse: TransactionResponse) => void) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({
    wallet,
  }));
  const signer = wallet.getSigner();
  return useMutation<TransactionResponse, Error, UseCreateDAOParams, DAOMutations.CreateDAO>(
    async (params: UseCreateDAOParams) => {
      return DexService.sendCreateDAOTransaction({ ...params, signer });
    },
    {
      onSuccess: (data: TransactionResponse) => {
        queryClient.invalidateQueries(DAOQueries.FetchAllDAOs);
        handleCreateDAOSuccess(data);
      },
    }
  );
}
