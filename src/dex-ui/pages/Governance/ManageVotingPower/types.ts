export interface ManageGovTokenProps {
  errorMessage?: string;
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  isSubmitButtonDisabled?: boolean;
  onSubmit?: () => Promise<void>;
  onErrorMessageDismiss?: () => void | undefined;
  onClose?: () => void | undefined;
  onLockClick?: () => Promise<void>;
  onUnlockClick?: () => Promise<void>;
}

export interface InputLabelProps {
  balance: string;
}

export type InputTokenAmountData = {
  lockAmount: string;
  unLockAmount: string;
};
