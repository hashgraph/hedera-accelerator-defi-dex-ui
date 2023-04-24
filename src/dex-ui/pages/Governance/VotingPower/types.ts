export interface ManageVotingPowerProps {
  errorMessage?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  lockedGODToken: string;
  lockedGODTokenValue?: string;
  totalGODTokenBalance: string;
  totalGODTokenBalanceValue?: string;
  availableGODTokenBalance: string;
  availableGODTokenBalanceValue?: string;
  hidePendingStatus?: boolean;
  isSubmitButtonDisabled?: boolean;
  canUserClaimGODTokens?: boolean;
  onErrorMessageDismiss?: () => void | undefined;
  onClose?: () => void | undefined;
  onLockClick: (data: InputTokenAmountData) => void;
  onUnlockClick: (data: InputTokenAmountData) => void;
}

export interface InputLabelProps {
  balance: string;
}

export type InputTokenAmountData = {
  lockAmount: string;
  unLockAmount: string;
};

export enum ManageVotingPowerTabType {
  Lock = 0,
  Unlock,
}
