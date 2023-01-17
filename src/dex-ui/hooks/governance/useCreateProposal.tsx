import { GovernanceMutations, GovernanceQueries } from "./types";
import { TransactionResponse } from "@hashgraph/sdk";
import { HashConnectSigner } from "hashconnect/dist/esm/provider/signer";
import { useMutation, useQueryClient } from "react-query";
import { DexService } from "../../services";
import { CreateProposalType } from "./types";
import { WalletStore } from "../../store/walletSlice";

interface CreateNewTokenProposalData {
  title: string;
  signer: HashConnectSigner;
}

interface CreateTextProposalData {
  signer: HashConnectSigner;
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
  wallet: WalletStore;
}

interface CreateContractUpgradeProposalData {
  title: string;
  description: string;
  linkToDiscussion: string;
  implementationAddress: string;
  proxyAddress: string;
  signer: HashConnectSigner;
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
  return useMutation<TransactionResponse, Error, CreateProposalData, GovernanceMutations.ExecuteProposal>(
    (params: CreateProposalData) => {
      const { type, proposalData } = params;
      if (type === CreateProposalType.ContractUpgrade) {
        const { linkToDiscussion, title, signer, description, implementationAddress, proxyAddress } =
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
        const { signer, title, description, linkToDiscussion } = proposalData as CreateTextProposalData;
        return DexService.sendCreateTextProposalTransaction(title, description, linkToDiscussion, signer);
      } else {
        // TODO: In the default case its Token Tranfer
        const { wallet, title, description, linkToDiscussion, tokenToTransfer, amountToTransfer, accountToTransferTo } =
          proposalData as CreateTransferTokenProposalData;
        const preciseTransferTokenAmount = wallet.getTokenAmountWithPrecision(tokenToTransfer, amountToTransfer);
        return DexService.sendCreateTransferTokenProposalTransaction({
          title,
          linkToDiscussion,
          description,
          tokenToTransfer,
          amountToTransfer: preciseTransferTokenAmount,
          accountToTransferTo,
          signer: wallet.getSigner(),
        });
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(GovernanceQueries.FetchAllProposals);
      },
    }
  );
}
