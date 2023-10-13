import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";

interface UseCreateDAOUpgradeProposal {
  governanceTokenId: string;
  governorContractId: string;
  assetHolderEVMAddress: string;
  title: string;
  description: string;
  linkToDiscussion: string;
  newImplementationAddress: string;
  oldProxyAddress: string;
  proxyAdmin: string;
  nftTokenSerialId: number;
  daoType: string;
}

export function useCreateDAOUpgradeProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateDAOUpgradeProposal,
    DAOMutations.CreateDAOUpgradeProposal
  >(
    async (params: UseCreateDAOUpgradeProposal) => {
      return DexService.createUpgradeProxyProposal({ ...params, signer });
    },
    {
      onSuccess: (transactionResponse: TransactionResponse | undefined) => {
        if (isNil(transactionResponse)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs, DAOQueries.Proposals]);
        handleOnSuccess(transactionResponse);
      },
    }
  );
}
