import { VotingPower } from "@shared/ui-kit";
import { useManageNFTVotingPower } from "@dao/hooks";
import { useNavigate } from "react-router-dom";

export interface NFTVotingPowerComponentProps {
  governanceTokenId: string;
  tokenHolderAddress: string;
}

export const NFTVotingPower = (props: NFTVotingPowerComponentProps) => {
  const { governanceTokenId, tokenHolderAddress } = props;
  const {
    tokenData,
    isFormLoading,
    isLoading,
    canUserClaimGODTokens,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    doesUserHaveGOVTokensToLockAndUnlock,
    lockGODTokenSubmit,
    unLockGODTokenSubmit,
    isWalletConnected,
    wallet,
    tokenNFTs,
    lockedNFTSerialId,
  } = useManageNFTVotingPower(governanceTokenId, tokenHolderAddress);

  const navigate = useNavigate();

  function handleClickSwapButton() {
    navigate("/swap");
  }

  function handleConnectToWalletClick() {
    wallet.connectToWallet();
  }

  function handleClickLockGodTokenButton(lockNFTSerialId: number) {
    lockGODTokenSubmit.mutate({
      nftSerialId: lockNFTSerialId,
      tokenId: governanceTokenId,
      spenderContractId: tokenHolderAddress,
    });
  }

  function handleClickUnLockGodTokenButton() {
    unLockGODTokenSubmit.mutate({
      tokenHolderAddress,
    });
  }

  function resetServerState() {
    lockGODTokenSubmit.reset();
    unLockGODTokenSubmit.reset();
  }

  function handleErrorDialogDismissButtonClicked() {
    resetServerState();
  }

  return (
    <VotingPower
      tokenData={tokenData}
      tokenNFTs={tokenNFTs}
      lockedNFTSerialId={lockedNFTSerialId}
      isFormLoading={isFormLoading}
      isLoading={isLoading}
      canUserClaimGODTokens={canUserClaimGODTokens}
      loadingDialogMessage={loadingDialogMessage}
      isErrorDialogOpen={isErrorDialogOpen}
      errorDialogMessage={errorDialogMessage}
      doesUserHaveGOVTokensToLockAndUnlock={doesUserHaveGOVTokensToLockAndUnlock}
      handleClickLockGodTokenButton={handleClickLockGodTokenButton}
      handleClickUnLockGodTokenButton={handleClickUnLockGodTokenButton}
      handleConnectToWalletClick={handleConnectToWalletClick}
      handleClickSwapButton={handleClickSwapButton}
      handleErrorDialogDismissButtonClicked={handleErrorDialogDismissButtonClicked}
      isWalletConnected={isWalletConnected}
    />
  );
};
