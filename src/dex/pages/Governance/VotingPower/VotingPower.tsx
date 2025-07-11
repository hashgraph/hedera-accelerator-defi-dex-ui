import { HStack, Button, Spacer, Flex } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { GOVTokenDetails } from "./GOVTokenDetails";
import { ManageVotingPower } from "./ManageVotingPower";
import { useManageVotingPower } from "./useManageVotingPower";
import { InputTokenAmountData } from "./types";
import { Text, LoadingDialog, MetricLabel, LightningBoltIcon, SwapIcon, Color } from "@shared/ui-kit";

export interface VotingPowerComponentProps {
  governanceTokenId: string;
  tokenHolderAddress: string;
}

export const VotingPower = (props: VotingPowerComponentProps) => {
  const { governanceTokenId, tokenHolderAddress } = props;

  const {
    votingPower,
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
    walletId,
    wallet,
  } = useManageVotingPower(governanceTokenId, tokenHolderAddress);

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
    <>
      {walletId && (
        <Flex padding="16px 80px 0 80px">
          <p>Connected wallet ID: {walletId}</p>
        </Flex>
      )}
      <Flex direction="row" alignItems="center" height="120px" padding="16px 80px 0 80px" maxWidth="100%">
        <MetricLabel
          label="VOTING POWER"
          isLoading={isFormLoading}
          labelLeftIcon={<LightningBoltIcon />}
          labelTextColor={Color.Neutral._500}
          labelTextStyle="p xsmall medium"
          labelOpacity="1.0"
          value={votingPower!}
          valueTextColor={Color.Primary._600}
          valueStyle="h3 medium"
          valueUnitSymbol={tokenData.symbol}
          amount="$--.--"
        />
        <Spacer />
        <HStack padding="8px 24px" gap="40px" justify="right" borderRadius="8px" background={Color.Neutral._50}>
          <GOVTokenDetails
            tokenSymbol={tokenData.symbol ?? ""}
            lockedGODToken={votingPower!}
            totalGODTokenBalance={tokenData.total}
            availableGODTokenBalance={tokenData.available}
            isLoading={isFormLoading}
            hidePendingStatus
          />
          {doesUserHaveGOVTokensToLockAndUnlock ? (
            <ManageVotingPower
              tokenSymbol={tokenData.symbol ?? ""}
              isLoading={isFormLoading}
              canUserClaimGODTokens={canUserClaimGODTokens}
              lockedGODToken={votingPower!}
              totalGODTokenBalance={tokenData.total}
              availableGODTokenBalance={tokenData.available}
              onLockClick={handleClickLockGodTokenButton}
              onUnlockClick={handleClickUnLockGodTokenButton}
            />
          ) : isWalletConnected ? (
            <Button
              as="a"
              key="swap"
              variant="secondary"
              width="105px"
              leftIcon={<SwapIcon />}
              href={"https://defi-ui.zilbo.com/swap"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text.P_Small_Semibold>Swap</Text.P_Small_Semibold>
            </Button>
          ) : (
            <Button key="swap" variant="secondary" width="155px" onClick={handleConnectToWalletClick}>
              <Text.P_Small_Semibold>Connect To Wallet</Text.P_Small_Semibold>
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
    </>
  );
};
