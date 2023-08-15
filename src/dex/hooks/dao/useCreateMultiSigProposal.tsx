import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse, TokenId, AccountId } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService, MultiSigProposeTransactionType } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import HederaGnosisSafeJSON from "../../services/abi/HederaGnosisSafe.json";
import { isHbarToken } from "@dex/utils";

interface UseCreateMultiSigProposalParams {
  tokenId: string;
  receiverId: string;
  amount: number;
  decimals: number;
  multiSigDAOContractId: string;
  title: string;
  description: string;
  safeEVMAddress: string;
}

const getHbarTransferCalldata = () => {
  const ABI = ["function call()"];
  const iface = new ethers.utils.Interface(ABI);
  const data = iface.encodeFunctionData("call", []);
  return data;
};

export function useCreateMultiSigProposal(handleOnSuccess: HandleOnSuccess) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseCreateMultiSigProposalParams,
    DAOMutations.CreateMultiSigProposal
  >(
    async (params: UseCreateMultiSigProposalParams) => {
      const { tokenId, safeEVMAddress, receiverId, amount, decimals, multiSigDAOContractId, title, description } =
        params;
      const preciseAmount = BigNumber(amount).shiftedBy(decimals).toNumber();
      const contractInterface = new ethers.utils.Interface(HederaGnosisSafeJSON.abi);
      const tokenTransferData = contractInterface.encodeFunctionData("transferTokenViaSafe", [
        TokenId.fromString(tokenId).toSolidityAddress(),
        AccountId.fromString(receiverId).toSolidityAddress(),
        preciseAmount,
      ]);
      return DexService.sendProposeTransaction({
        safeEVMAddress: isHbarToken(tokenId) ? AccountId.fromString(receiverId).toSolidityAddress() : safeEVMAddress,
        hBarPayableValue: isHbarToken(tokenId) ? amount : 0,
        data: isHbarToken(tokenId) ? getHbarTransferCalldata() : tokenTransferData,
        transactionType: isHbarToken(tokenId)
          ? MultiSigProposeTransactionType.HBARTokenTransfer
          : MultiSigProposeTransactionType.TokenTransfer,
        title,
        multiSigDAOContractId,
        description,
        signer,
      });
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
