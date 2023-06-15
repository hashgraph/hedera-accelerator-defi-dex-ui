import { Text, HStack, Button, Spacer, Flex } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { GOVTokenDetails } from "./GOVTokenDetails";
import { ManageVotingPower } from "./ManageVotingPower";
import { useNavigate } from "react-router-dom";
import { useManageVotingPower } from "./useManageVotingPower";
import { InputTokenAmountData } from "./types";
import { LoadingDialog, MetricLabel, LightningBoltIcon, SwapIcon, Color } from "@dex-ui-components";
export interface VotingPowerComponentProps {
  governanceTokenId: string;
  tokenHolderAddress: string;
}

export const VotingPower = (props: VotingPowerComponentProps) => {
  const { governanceTokenId, tokenHolderAddress } = props;
  const {
    godToken,
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
    walletId,
    wallet,
  } = useManageVotingPower(governanceTokenId, tokenHolderAddress);

  const navigate = useNavigate();

  function handleClickSwapButton() {
    navigate("/swap");
  }

  function handleConnectToWalletClick() {
    wallet.connectToWallet();
  }

  function handleClickLockGodTokenButton(data: InputTokenAmountData) {
    lockGODTokenSubmit.mutate({
      accountId: walletId,
      amount: Number(data.lockAmount),
      tokenHolderAddress,
      governanceTokenId,
    });
  }

  function handleClickUnLockGodTokenButton(data: InputTokenAmountData) {
    unLockGODTokenSubmit.mutate({
      tokenAmount: Number(data.unLockAmount),
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
    <Flex direction="row" alignItems="center" height="120px" padding="16px 80px 0 80px" maxWidth="100%">
      <MetricLabel
        label="VOTING POWER"
        isLoading={isFormLoading}
        labelLeftIcon={<LightningBoltIcon />}
        labelTextColor={Color.Neutral._500}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value={godToken.locked}
        valueTextColor={Color.Primary._600}
        valueStyle="h3 medium"
        valueUnitSymbol="GOV"
        amount="$--.--"
      />
      <Spacer />
      <HStack padding="8px 24px" gap="40px" justify="right" borderRadius="8px" background={Color.Neutral._50}>
        <GOVTokenDetails
          lockedGODToken={godToken.locked}
          totalGODTokenBalance={godToken.total}
          availableGODTokenBalance={godToken.available}
          isLoading={isFormLoading}
          hidePendingStatus
        />
        {doesUserHaveGOVTokensToLockAndUnlock ? (
          <ManageVotingPower
            isLoading={isFormLoading}
            canUserClaimGODTokens={canUserClaimGODTokens}
            lockedGODToken={godToken.locked}
            totalGODTokenBalance={godToken.total}
            availableGODTokenBalance={godToken.available}
            onLockClick={handleClickLockGodTokenButton}
            onUnlockClick={handleClickUnLockGodTokenButton}
          />
        ) : isWalletConnected ? (
          <Button key="swap" variant="secondary" width="105px" leftIcon={<SwapIcon />} onClick={handleClickSwapButton}>
            <Text textStyle="p small semibold">Swap</Text>
          </Button>
        ) : (
          <Button key="swap" variant="secondary" width="155px" onClick={handleConnectToWalletClick}>
            <Text textStyle="p small semibold">Connect To Wallet</Text>
          </Button>
        )}
      </HStack>
      <LoadingDialog isOpen={isLoading} message={loadingDialogMessage} />
      <LoadingDialog
        isOpen={isErrorDialogOpen}
        message={errorDialogMessage}
        icon={<WarningIcon h={10} w={10} />}
        buttonConfig={{
          text: "Dismiss",
          onClick: handleErrorDialogDismissButtonClicked,
        }}
      />
    </Flex>
  );
};
