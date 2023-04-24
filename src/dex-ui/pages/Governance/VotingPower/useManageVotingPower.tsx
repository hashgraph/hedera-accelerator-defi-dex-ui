import {
  useCanUserUnlockGODToken,
  useDexContext,
  useFetchLockedGovToken,
  useLockGODToken,
  useTokenBalance,
  useUnlockGODToken,
} from "../../../hooks";
import { createHashScanAccountIdLink, createHashScanTransactionLink } from "../../../utils";
import { GovernanceTokenId } from "../../../services";

export function useManageVotingPower() {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const isWalletConnected = wallet.isPaired();
  const walletId = wallet?.savedPairingData?.accountIds[0] ?? "";

  const govTokenBalance = useTokenBalance({ tokenId: GovernanceTokenId });

  const lockedGOVToken = useFetchLockedGovToken(walletId);
  const canClaimGODTokens = useCanUserUnlockGODToken(walletId);
  const lockGODTokenSubmit = useLockGODToken(walletId);
  const unLockGODTokenSubmit = useUnlockGODToken(walletId);

  const totalGodToken = (lockedGOVToken.data ?? 0) + (govTokenBalance.data ?? 0);
  const godToken = {
    locked: isWalletConnected ? `${lockedGOVToken.data?.toFixed(4) ?? 0}` : "-",
    available: isWalletConnected ? `${govTokenBalance.data?.toFixed(4) ?? 0}` : "-",
    total: isWalletConnected ? `${totalGodToken.toFixed(4)}` : "-",
  };

  const isFormLoading = govTokenBalance.isLoading || lockedGOVToken.isLoading || canClaimGODTokens.isLoading;
  const isLoading = lockGODTokenSubmit.isLoading || unLockGODTokenSubmit.isLoading;
  const canUserClaimGODTokens = canClaimGODTokens.data;

  // For Now the SWAP button to show we are keeping to the -4 precision value to match with UI
  const doesUserHaveGOVTokensToLockAndUnlock = isWalletConnected && totalGodToken > 0.0001;

  function getLoadingDialogMessage(): string {
    if (lockGODTokenSubmit.isLoading) return "Please confirm the locking of GOD Tokens in your wallet to proceed.";
    if (unLockGODTokenSubmit.isLoading) return "Please confirm the unlocking of GOD Tokens in your wallet to proceed.";
    return "";
  }
  const loadingDialogMessage = getLoadingDialogMessage();

  const isErrorDialogOpen = lockGODTokenSubmit.isError || unLockGODTokenSubmit.isError;
  function getErrorDialogMessage(): string {
    if (lockGODTokenSubmit.isError) return lockGODTokenSubmit.error?.message;
    if (unLockGODTokenSubmit.isError) return unLockGODTokenSubmit.error?.message;
    return "";
  }
  const errorDialogMessage = getErrorDialogMessage();

  const isNotificationVisible = lockGODTokenSubmit.isSuccess || unLockGODTokenSubmit.isSuccess;

  function getSuccessMessage(): string {
    if (lockGODTokenSubmit.isSuccess) return `Successfully Locked GOD Tokens`;
    if (unLockGODTokenSubmit.isSuccess) return `Successfully UnLocked GOD Tokens`;
    return "";
  }
  const successMessage = getSuccessMessage();

  function getHashScanLink(): string | undefined {
    if (lockGODTokenSubmit.isSuccess) {
      const lockGODTokenTransactionId = lockGODTokenSubmit.data?.transactionId.toString();
      return createHashScanTransactionLink(lockGODTokenTransactionId);
    }
    if (unLockGODTokenSubmit.isSuccess) {
      const unLockGODTokenTransactionId = unLockGODTokenSubmit.data?.transactionId.toString();
      return createHashScanTransactionLink(unLockGODTokenTransactionId);
    }
  }
  const hashScanTransactionLink = getHashScanLink();
  const hashScanAccountLink = createHashScanAccountIdLink(walletId);

  return {
    successMessage,
    isNotificationVisible,
    hashScanTransactionLink,
    hashScanAccountLink,
    isFormLoading,
    isLoading,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    isWalletConnected,
    godToken,
    doesUserHaveGOVTokensToLockAndUnlock,
    canUserClaimGODTokens,
    lockGODTokenSubmit,
    unLockGODTokenSubmit,
    walletId,
    wallet,
  };
}
