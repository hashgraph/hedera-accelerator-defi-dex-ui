import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface UseUpdateDAODetailsParams {
  name: string;
  description: string;
  logoUrl: string;
  infoUrl: string;
  webLinks: string[];
  daoAccountId: string;
}

export function useUpdateDAODetails(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<TransactionResponse | undefined, Error, UseUpdateDAODetailsParams, DAOMutations.UpdateDAODetails>(
    async (params: UseUpdateDAODetailsParams) => {
      return DexService.sendUpdateDAODetailsTransaction({ ...params, signer });
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
