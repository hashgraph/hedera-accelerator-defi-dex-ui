import { useDexContext, useTokenBalance } from "../../../hooks";
// import { createHashScanAccountIdLink } from "../../../utils";
import { GovernanceTokenId } from "../../../services";

export function useManageVotingPower() {
  const { wallet } = useDexContext(({ wallet }) => ({ wallet }));
  const govTokenBalance = useTokenBalance({ tokenId: GovernanceTokenId });
  const isLoading = govTokenBalance.isLoading;

  const lockedGOVBalance = 100.0;
  const isWalletConnected = wallet.isPaired();
  const userGOVTokenWalletBalance = govTokenBalance.data ?? 0;
  const doesUserHaveGOVTokensToLock = userGOVTokenWalletBalance >= 0;
  const userTotalGOVTokenBalance = lockedGOVBalance + userGOVTokenWalletBalance;

  function getLoadingDialogMessage(): string {
    return "";
  }
  const loadingDialogMessage = getLoadingDialogMessage();

  const isErrorDialogOpen = false;

  function getErrorDialogMessage(): string {
    return "";
  }
  const errorDialogMessage = getErrorDialogMessage();

  function getSuccessMessage(): string {
    return "";
  }
  const successMessage = getSuccessMessage();
  // function getHashScanLink(): string | undefined {
  //     return undefined;
  // }
  // const hashScanTransactionLink = getHashScanLink();
  // const hashScanAccountLink = createHashScanAccountIdLink(wallet.getSigner().getAccountId().toString());

  return {
    successMessage,
    // hashScanTransactionLink,
    // hashScanAccountLink,
    isLoading,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    isWalletConnected,
    userGOVTokenWalletBalance,
    doesUserHaveGOVTokensToLock,
    userTotalGOVTokenBalance,
    lockedGOVBalance,
  };
}
