import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { CreateProposalType } from "./types";
import { useDexContext } from "../useDexContext";

interface CreateNewTokenProposalData {
  title: string;
}

interface CreateTextProposalData {
  title: string;
  description: string;
  linkToDiscussion: string;
}

interface CreateTransferTokenProposalData {
  title: string;
  description: string;
  linkToDiscussion: string;
  accountToTransferTo: string;
  tokenToTransfer: string;
  amountToTransfer: number;
}

interface CreateContractUpgradeProposalData {
  title: string;
  description: string;
  linkToDiscussion: string;
  implementationAddress: string;
  proxyAddress: string;
}

interface CreateProposalData {
  type: CreateProposalType;
  proposalData: CreateProposalDataTypes;
}

type CreateProposalDataTypes =
  | CreateNewTokenProposalData
  | CreateTextProposalData
  | CreateTransferTokenProposalData
  | CreateContractUpgradeProposalData;

export function useCreateProposal() {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<TransactionResponse, Error, CreateProposalData, GovernanceMutations.ExecuteProposal>(
    (params: CreateProposalData) => {
      const { type, proposalData } = params;
      if (type === CreateProposalType.ContractUpgrade) {
        const { linkToDiscussion, title, description, implementationAddress, proxyAddress } =
          proposalData as CreateContractUpgradeProposalData;
        return DexService.sendCreateContractUpgradeProposalTransaction({
          title,
          signer,
          description,
          contarctId: implementationAddress,
          proxyId: proxyAddress,
          linkToDiscussion,
        });
      } else if (type === CreateProposalType.Text) {
        const { title, description, linkToDiscussion } = proposalData as CreateTextProposalData;
        return DexService.sendCreateTextProposalTransaction(title, description, linkToDiscussion, signer);
      } else {
        // TODO: In the default case its Token Tranfer
        const { title, description, linkToDiscussion, tokenToTransfer, amountToTransfer, accountToTransferTo } =
          proposalData as CreateTransferTokenProposalData;
        const preciseTransferTokenAmount = wallet.getTokenAmountWithPrecision(tokenToTransfer, amountToTransfer);
        return DexService.sendCreateTransferTokenProposalTransaction({
          title,
          linkToDiscussion,
          description,
          tokenToTransfer,
          amountToTransfer: preciseTransferTokenAmount,
          accountToTransferTo,
          signer: signer,
        });
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([GovernanceQueries.Proposals, "list"]);
      },
    }
  );
}
