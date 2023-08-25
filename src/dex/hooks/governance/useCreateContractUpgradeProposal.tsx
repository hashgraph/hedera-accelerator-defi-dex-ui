import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { GovernanceMutations, GovernanceQueries } from "./types";
import { DexService } from "@dex/services";
import { useDexContext } from "@dex/hooks";
import { isNil } from "ramda";

interface CreateContractUpgradeProposalData {
  title: string;
  description: string;
  linkToDiscussion: string;
  contractToUpgrade: string;
  newContractProxyId: string;
  nftTokenSerialId: number;
}

export function useCreateContractUpgradeProposal(
  handleSendProposesSuccess: (transactionResponse: TransactionResponse) => void
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    CreateContractUpgradeProposalData,
    GovernanceMutations.CreateContractUpgradeProposal
  >(
    async (params: CreateContractUpgradeProposalData) => {
      return DexService.sendCreateContractUpgradeProposalTransaction({ ...params, signer });
    },
    {
      onSuccess: (data: TransactionResponse | undefined) => {
        if (isNil(data)) return;
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
        handleSendProposesSuccess(data);
      },
    }
  );
}
