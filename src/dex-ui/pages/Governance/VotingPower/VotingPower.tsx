import { Text, HStack, Button, Spacer, Flex } from "@chakra-ui/react";
import { Color } from "../../../../dex-ui-components/themes";
import { LightningBoltIcon, SwapIcon } from "../../../../dex-ui-components/base/Icons";
import { GOVTokenDetails } from "./GOVTokenDetails";
import { ManageVotingPower } from "./ManageVotingPower";
import { useNavigate } from "react-router-dom";
import { useManageVotingPower } from "./useManageVotingPower";
import { LoadingDialog, MetricLabel, NotficationTypes } from "../../../../dex-ui-components";
import { InputTokenAmountData } from "./types";
import { WarningIcon } from "@chakra-ui/icons";
import { Notification } from "../../../../dex-ui-components";

export const VotingPower = () => {
  const {
    godToken,
    isFormLoading,
    isLoading,
    canUserClaimGODTokens,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    isNotificationVisible,
    successMessage,
    doesUserHaveGOVTokensToLockAndUnlock,
    hashScanTransactionLink,
    lockGODTokenSubmit,
    unLockGODTokenSubmit,
    isWalletConnected,
    walletId,
    wallet,
  } = useManageVotingPower();

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
    });
  }

  function handleClickUnLockGodTokenButton(data: InputTokenAmountData) {
    unLockGODTokenSubmit.mutate({
      tokenAmount: Number(data.unLockAmount),
    });
  }

  function resetServerState() {
    lockGODTokenSubmit.reset();
    unLockGODTokenSubmit.reset();
  }

  function handleErrorDialogDismissButtonClicked() {
    resetServerState();
  }

  function handleNotificationCloseButtonClicked() {
    resetServerState();
  }

  return (
    <Flex direction="column" maxWidth="100%" padding="0px 80px 0px">
      <Notification
        type={NotficationTypes.SUCCESS}
        message={successMessage}
        isLinkShown={true}
        linkText="View in HashScan"
        linkRef={hashScanTransactionLink}
        isCloseButtonShown={true}
        isVisible={isNotificationVisible}
        handleClickClose={handleNotificationCloseButtonClicked}
      />
      <Flex
        direction="row"
        alignItems="center"
        height="88px"
        paddingTop={isNotificationVisible ? "30px" : "0px"}
        maxWidth="100%"
      >
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
        <HStack
          height="96px"
          padding="8px 24px"
          gap="40px"
          justify="right"
          borderRadius="8px"
          background={Color.Neutral._50}
        >
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
            <Button
              key="swap"
              variant="secondary"
              width="105px"
              leftIcon={<SwapIcon />}
              onClick={handleClickSwapButton}
            >
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
    </Flex>
  );
};
