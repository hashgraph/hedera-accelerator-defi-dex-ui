import { useMutation, useQueryClient } from "react-query";
import { TransactionResponse } from "@hashgraph/sdk";
import { DAOMutations, DAOQueries } from "./types";
import { DexService } from "@services";
import { useDexContext } from "@hooks";
import { isNil } from "ramda";
import { MemberOperationsType } from "@pages";

interface AddMemberForm {
  newMemberAddress: string;
  safeAccountId: string;
  threshold: number;
  multiSigDAOContractId: string;
}

interface DeleteMemberForm {
  memberAddress: string;
  safeAccountId: string;
  threshold: number;
  multiSigDAOContractId: string;
}

interface ReplaceMemberForm {
  newMemberAddress: string;
  oldMemberAddress: string;
  safeAccountId: string;
  multiSigDAOContractId: string;
}

interface ChangeThresholdForm {
  threshold: number;
  safeAccountId: string;
  multiSigDAOContractId: string;
}

type UseUpdateMemberParams = (AddMemberForm | DeleteMemberForm | ReplaceMemberForm | ChangeThresholdForm) & {
  type: MemberOperationsType;
};

export function useSendProposeTransaction(
  handleSendProposesSuccess: (transactionResponse: TransactionResponse) => void
) {
  const queryClient = useQueryClient();
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const signer = wallet.getSigner();

  return useMutation<
    TransactionResponse | undefined,
    Error,
    UseUpdateMemberParams,
    DAOMutations.CreateProposeTransaction
  >(
    async (params: UseUpdateMemberParams) => {
      const { type, ...data } = params;
      if (type === MemberOperationsType.AddMember) {
        const addMemberData = data as AddMemberForm;
        return DexService.proposeAddOwnerWithThreshold({ ...addMemberData, signer });
      }
      if (type === MemberOperationsType.DeleteMember) {
        const removeMemberData = data as DeleteMemberForm;
        return DexService.proposeRemoveOwnerWithThreshold({ ...removeMemberData, signer });
      }
      if (type === MemberOperationsType.ReplaceMember) {
        const replaceMemberData = data as ReplaceMemberForm;
        return DexService.proposeSwapOwnerWithThreshold({ ...replaceMemberData, signer });
      }
      if (type === MemberOperationsType.ChangeThreshold) {
        const changeThresholdData = data as ChangeThresholdForm;
        return DexService.proposeChangeThreshold({ ...changeThresholdData, signer });
      }
    },
    {
      onSuccess: (data: TransactionResponse | undefined) => {
        if (isNil(data)) return;
        queryClient.invalidateQueries([DAOQueries.DAOs, DAOQueries.Transactions]);
        handleSendProposesSuccess(data);
      },
    }
  );
}
