import {
  useCanUserUnlockGODToken,
  useDexContext,
  useFetchLockedGovToken,
  useLockGODToken,
  useTokenBalance,
  useUnlockGODToken,
  useHandleTransactionSuccess,
  useToken,
} from "@hooks";
import { TransactionResponse } from "@hashgraph/sdk";

export function useManageVotingPower(governanceTokenId: string, tokenHolderAddress: string) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const isWalletConnected = wallet.isPaired();
  const walletId = wallet?.savedPairingData?.accountIds[0] ?? "";
  const { data: token } = useToken(governanceTokenId);
  const govTokenBalance = useTokenBalance({ tokenId: governanceTokenId });

  const lockedGOVToken = useFetchLockedGovToken(walletId, tokenHolderAddress);
  const canClaimGODTokens = useCanUserUnlockGODToken(walletId, tokenHolderAddress);
  const lockGODTokenSubmit = useLockGODToken(walletId, tokenHolderAddress, handleLockedGODTokenSuccess);
  const unLockGODTokenSubmit = useUnlockGODToken(walletId, tokenHolderAddress, handleUnLockedGODTokenSuccess);

  const totalGodToken = (lockedGOVToken.data ?? 0) + (govTokenBalance?.data ?? 0);
  const tokenData = {
    symbol: token?.data.symbol,
    locked: isWalletConnected ? `${lockedGOVToken.data?.toFixed(4) ?? 0}` : "-",
    available: isWalletConnected ? `${govTokenBalance?.data?.toFixed(4) ?? 0}` : "-",
    total: isWalletConnected ? `${totalGodToken.toFixed(4)}` : "-",
  };

  const handleTransactionSuccess = useHandleTransactionSuccess();

  const isFormLoading = govTokenBalance?.isLoading || lockedGOVToken.isLoading || canClaimGODTokens.isLoading;
  const isLoading = lockGODTokenSubmit.isLoading || unLockGODTokenSubmit.isLoading;
  const canUserClaimGODTokens = canClaimGODTokens.data ?? false;

  // For Now the SWAP button to show we are keeping to the -4 precision value to match with UI
  const doesUserHaveGOVTokensToLockAndUnlock = isWalletConnected && totalGodToken > 0.0001;

  function getLoadingDialogMessage(): string {
    if (lockGODTokenSubmit.isLoading)
      return `Please confirm the locking of ${tokenData.symbol} tokens in your wallet to proceed.`;
    if (unLockGODTokenSubmit.isLoading)
      return `Please confirm the unlocking of ${tokenData.symbol} tokens in your wallet to proceed.`;
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

  function handleLockedGODTokenSuccess(transactionResponse: TransactionResponse) {
    const message = `Successfully locked ${tokenData.symbol} tokens.`;
    handleTransactionSuccess(transactionResponse, message);
  }

  function handleUnLockedGODTokenSuccess(transactionResponse: TransactionResponse) {
    const message = `Successfully unlocked ${tokenData.symbol} tokens.`;
    handleTransactionSuccess(transactionResponse, message);
  }

  return {
    isFormLoading,
    isLoading,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    isWalletConnected,
    tokenData,
    doesUserHaveGOVTokensToLockAndUnlock,
    canUserClaimGODTokens,
    lockGODTokenSubmit,
    unLockGODTokenSubmit,
    walletId,
    wallet,
  };
}
