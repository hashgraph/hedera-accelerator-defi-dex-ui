import {
  useCanUserUnlockGODToken,
  useDexContext,
  useHandleTransactionSuccess,
  useToken,
  useTokenBalance,
  useTokenNFTs,
} from "@dex/hooks";
import { TransactionResponse } from "@hashgraph/sdk";
import { useFetchLockedNFTToken, useLockNFTToken, useUnlockNFTToken } from "@dao/hooks";

export function useManageNFTVotingPower(governanceTokenId: string, tokenHolderAddress: string) {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const isWalletConnected = wallet.isPaired();
  const walletId = wallet?.savedPairingData?.accountIds[0] ?? "";
  const { data: token } = useToken(governanceTokenId);
  const { data: tokenNFTs = [] } = useTokenNFTs(governanceTokenId);
  const govTokenBalance = useTokenBalance({ tokenId: governanceTokenId });

  const lockedNFTToken = useFetchLockedNFTToken(walletId, tokenHolderAddress);
  const canClaimGODTokens = useCanUserUnlockGODToken(walletId, tokenHolderAddress);
  const lockGODTokenSubmit = useLockNFTToken(walletId, tokenHolderAddress, handleLockedGODTokenSuccess);
  const unLockGODTokenSubmit = useUnlockNFTToken(walletId, tokenHolderAddress, handleUnLockedGODTokenSuccess);

  const totalGodToken = (Number(lockedNFTToken.data) ? 1 : 0) + (govTokenBalance?.data ?? 0);
  const tokenData = {
    symbol: token?.data.symbol,
    locked: isWalletConnected ? `${Number(lockedNFTToken.data) ? 1 : 0}` : "-",
    available: isWalletConnected ? `${govTokenBalance.data ?? 0}` : "-",
    total: isWalletConnected ? `${totalGodToken}` : "-",
  };
  const lockedNFTSerialId = lockedNFTToken.data;

  const handleTransactionSuccess = useHandleTransactionSuccess();

  const isFormLoading = govTokenBalance?.isLoading || lockedNFTToken.isLoading || canClaimGODTokens.isLoading;
  const isLoading = lockGODTokenSubmit.isLoading || unLockGODTokenSubmit.isLoading;
  const canUserClaimGODTokens = canClaimGODTokens.data ?? false;

  // For Now the SWAP button to show we are keeping to the -4 precision value to match with UI
  const doesUserHaveGOVTokensToLockAndUnlock = isWalletConnected && totalGodToken > 0.0001;

  function getLoadingDialogMessage(): string {
    if (lockGODTokenSubmit.isLoading)
      return `Please confirm the locking of ${tokenData.symbol} tokens in your account to proceed.`;
    if (unLockGODTokenSubmit.isLoading)
      return `Please confirm the unlocking of ${tokenData.symbol} tokens in your account to proceed.`;
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
    wallet,
    tokenNFTs,
    lockedNFTSerialId,
  };
}
