import { WarningIcon } from "@chakra-ui/icons";
import { HStack, Button, Spacer, Flex, useBreakpointValue, Box } from "@chakra-ui/react";
import { MirrorNodeTokenNFT } from "@dex/services";
import { Text, LightningBoltIcon, LoadingDialog, MetricLabel, SwapIcon, useTheme } from "@shared/ui-kit";
import { GOVTokenDetails } from "./GOVTokenDetails";
import { ManageVotingPower } from "./ManageVotingPower";
import { InputTokenData } from "./types";

export interface VotingPowerProps {
  tokenData: any;
  tokenNFTs: MirrorNodeTokenNFT[];
  lockedNFTSerialId?: number;
  isFormLoading: boolean;
  isLoading: boolean;
  canUserClaimGODTokens: boolean;
  loadingDialogMessage: string;
  isErrorDialogOpen: boolean;
  errorDialogMessage: string;
  doesUserHaveGOVTokensToLockAndUnlock: boolean;
  handleClickLockGodTokenButton: (lockNFTSerialId: number) => void;
  handleClickUnLockGodTokenButton: () => void;
  handleConnectToWalletClick: () => void;
  handleClickSwapButton: () => void;
  handleErrorDialogDismissButtonClicked: () => void;
  isWalletConnected: boolean;
  hideSwapButton?: boolean;
}

export const VotingPower = (props: VotingPowerProps) => {
  const theme = useTheme();
  const {
    tokenData,
    tokenNFTs,
    lockedNFTSerialId,
    isFormLoading,
    isLoading,
    canUserClaimGODTokens,
    loadingDialogMessage,
    isErrorDialogOpen,
    errorDialogMessage,
    doesUserHaveGOVTokensToLockAndUnlock,
    handleClickLockGodTokenButton,
    handleClickUnLockGodTokenButton,
    handleConnectToWalletClick,
    handleClickSwapButton,
    handleErrorDialogDismissButtonClicked,
    isWalletConnected,
    hideSwapButton = false,
  } = props;

  const isMobile = useBreakpointValue({ base: true, md: false });
  const padding = useBreakpointValue({ base: "0.75rem 1rem", sm: "1rem 1.5rem", md: "1rem 3rem", lg: "1rem 5rem" });
  const flexDirection = useBreakpointValue({ base: "column", lg: "row" }) as "column" | "row";
  const showTokenDetails = useBreakpointValue({ base: false, md: true });

  return (
    <Flex
      direction={flexDirection}
      alignItems={{ base: "stretch", lg: "center" }}
      minHeight={{ base: "auto", lg: "7.5rem" }}
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
        value={tokenData.locked}
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
        borderRadius="0.5rem"
        background={theme.bgSecondary}
        border={`1px solid ${theme.border}`}
        flexWrap="wrap"
      >
        {showTokenDetails && (
          <GOVTokenDetails
            tokenSymbol={tokenData.symbol ?? ""}
            lockedGODToken={tokenData.locked}
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
              tokenNFTs={tokenNFTs}
              isLoading={isFormLoading}
              canUserClaimGODTokens={canUserClaimGODTokens}
              lockedNFTSerialId={lockedNFTSerialId}
              totalGODTokenBalance={tokenData.total}
              availableGODTokenBalance={tokenData.available}
              onLockClick={(data: InputTokenData) => handleClickLockGodTokenButton(Number(data.lockNFTSerialId))}
              onUnlockClick={handleClickUnLockGodTokenButton}
            />
          ) : isWalletConnected && !hideSwapButton ? (
            <Button
              key="swap"
              variant="secondary"
              width={{ base: "100%", sm: "6.5rem" }}
              size={{ base: "sm", md: "md" }}
              leftIcon={<SwapIcon />}
              onClick={() => window.open("/swap", "_blank")}
            >
              Swap
            </Button>
          ) : !isWalletConnected ? (
            <Button
              key="swap"
              variant="secondary"
              width={{ base: "100%", sm: "auto" }}
              size={{ base: "sm", md: "md" }}
              onClick={handleConnectToWalletClick}
            >
              Connect To Wallet
            </Button>
          ) : null}
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
  );
};
