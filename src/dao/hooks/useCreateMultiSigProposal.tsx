import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse, TokenId, AccountId, Hbar, HbarUnit } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService, HBARTokenAddress } from "@dex/services";
import { useDexContext, HandleOnSuccess } from "@dex/hooks";
import { isNil } from "ramda";
import BigNumber from "bignumber.js";
import { isHbarToken } from "@dex/utils";
import { isNFT } from "shared";

interface UseCreateMultiSigProposalParams {
  tokenId: string;
  receiverId: string;
  amount: number;
  decimals: number;
  multiSigDAOContractId: string;
  title: string;
  description: string;
  tokenType: string;
  nftSerialId: number;
}

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
      const {
        tokenId,
        receiverId,
        amount,
        decimals,
        multiSigDAOContractId,
        title,
        description,
        tokenType,
        nftSerialId,
      } = params;
      const preciseAmount = isHbarToken(tokenId)
        ? Hbar.from(amount, HbarUnit.Hbar).toTinybars().toNumber()
        : BigNumber(amount).shiftedBy(decimals).toNumber();

      return DexService.sendProposeTransferTransaction({
        to: AccountId.fromString(receiverId).toSolidityAddress(),
        tokenAddress: TokenId.fromString(isHbarToken(tokenId) ? HBARTokenAddress : tokenId).toSolidityAddress(),
        amountOrId: isNFT(tokenType) ? nftSerialId : preciseAmount,
        multiSigDAOContractId,
        title,
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
