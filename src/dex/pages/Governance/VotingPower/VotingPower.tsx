import { HStack, Button, Spacer, Flex, useBreakpointValue } from "@chakra-ui/react";
import { WarningIcon } from "@chakra-ui/icons";
import { GOVTokenDetails } from "./GOVTokenDetails";
import { ManageVotingPower } from "./ManageVotingPower";
import { useManageVotingPower } from "./useManageVotingPower";
import { InputTokenAmountData } from "./types";
import { Text, LoadingDialog, MetricLabel, LightningBoltIcon, SwapIcon, useTheme } from "@shared/ui-kit";

export interface VotingPowerComponentProps {
  governanceTokenId: string;
  tokenHolderAddress: string;
}

export const VotingPower = (props: VotingPowerComponentProps) => {
  const theme = useTheme();
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

  const padding = useBreakpointValue({ base: "0.75rem 1rem", sm: "1rem 1.5rem", md: "1rem 3rem", lg: "1rem 5rem" });
  const flexDirection = useBreakpointValue({ base: "column", lg: "row" }) as "column" | "row";
  const showTokenDetails = useBreakpointValue({ base: false, md: true });

  return (
    <>
      {walletId && (
        <Flex padding={{ base: "0.75rem 1rem", sm: "1rem 1.5rem", md: "1rem 3rem", lg: "1rem 5rem" }}>
          <Text.P_Small_Regular>Connected wallet ID: {walletId}</Text.P_Small_Regular>
        </Flex>
      )}
      <Flex
        direction={flexDirection}
        alignItems={{ base: "stretch", lg: "center" }}
        minHeight={{ base: "auto", lg: "120px" }}
        padding={padding}
        maxWidth="100%"
        gap={{ base: 3, lg: 0 }}
      >
        <MetricLabel
          label="VOTING POWER"
          isLoading={isFormLoading}
          labelLeftIcon={<LightningBoltIcon />}
          labelTextColor={theme.textMuted}
          labelTextStyle="p xsmall medium"
          labelOpacity="1.0"
          value={votingPower!}
          valueTextColor={theme.accent}
          valueStyle="h3 medium"
          valueUnitSymbol={tokenData.symbol}
          amount="$--.--"
          amountLabelColor={theme.textMuted}
        />
        <Spacer display={{ base: "none", lg: "block" }} />
        <Flex
          direction={{ base: "column", sm: "row" }}
          padding={{ base: "0.5rem", sm: "0.5rem 1rem", md: "0.5rem 1.5rem" }}
          gap={{ base: 2, sm: 3, md: "2.5rem" }}
          justify={{ base: "center", sm: "space-between", md: "right" }}
          alignItems={{ base: "stretch", sm: "center" }}
          borderRadius="8px"
          background={theme.bgSecondary}
          border={`1px solid ${theme.border}`}
          flexWrap="wrap"
        >
          {showTokenDetails && (
            <GOVTokenDetails
              tokenSymbol={tokenData.symbol ?? ""}
              lockedGODToken={votingPower!}
              totalGODTokenBalance={tokenData.total}
              availableGODTokenBalance={tokenData.available}
              isLoading={isFormLoading}
              hidePendingStatus
            />
          )}
          <Flex justify={{ base: "center", sm: "flex-end" }} gap={2}>
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
                key="swap"
                variant="secondary"
                width={{ base: "100%", sm: "105px" }}
                size={{ base: "sm", md: "md" }}
                leftIcon={<SwapIcon />}
                onClick={() => {
                  const protocol = window.location.protocol;
                  const port = window.location.port ? `:${window.location.port}` : "";
                  window.open(`${protocol}//defi-ui.localhost${port}/swap`, "_blank");
                }}
              >
                <Text.P_Small_Semibold>Swap</Text.P_Small_Semibold>
              </Button>
            ) : (
              <Button
                key="swap"
                variant="secondary"
                width={{ base: "100%", sm: "auto" }}
                size={{ base: "sm", md: "md" }}
                onClick={handleConnectToWalletClick}
              >
                <Text.P_Small_Semibold>Connect To Wallet</Text.P_Small_Semibold>
              </Button>
            )}
          </Flex>
        </Flex>
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
