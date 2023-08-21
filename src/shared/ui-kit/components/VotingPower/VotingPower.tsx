import { WarningIcon } from "@chakra-ui/icons";
import { Text, HStack, Button, Spacer, Flex } from "@chakra-ui/react";
import { MirrorNodeTokenNFT } from "@dex/services";
import { Color, LightningBoltIcon, LoadingDialog, MetricLabel, SwapIcon } from "@shared/ui-kit";
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
}

export const VotingPower = (props: VotingPowerProps) => {
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
  } = props;
  return (
    <Flex direction="row" alignItems="center" height="7.5rem" padding="1rem 5rem 0 5rem" maxWidth="100%">
      <MetricLabel
        label="VOTING POWER"
        isLoading={isFormLoading}
        labelLeftIcon={<LightningBoltIcon />}
        labelTextColor={Color.Neutral._500}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value={tokenData.locked}
        valueTextColor={Color.Primary._600}
        valueStyle="h3 medium"
        valueUnitSymbol={tokenData.symbol}
        amount="$--.--"
      />
      <Spacer />
      <HStack padding="0.5rem 1.5rem" gap="2.5rem" justify="right" borderRadius="0.5rem" background={Color.Neutral._50}>
        <GOVTokenDetails
          tokenSymbol={tokenData.symbol ?? ""}
          lockedGODToken={tokenData.locked}
          totalGODTokenBalance={tokenData.total}
          availableGODTokenBalance={tokenData.available}
          isLoading={isFormLoading}
          hidePendingStatus
        />
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
        ) : isWalletConnected ? (
          <Button key="swap" variant="secondary" width="6.5rem" leftIcon={<SwapIcon />} onClick={handleClickSwapButton}>
            <Text textStyle="p small semibold">Swap</Text>
          </Button>
        ) : (
          <Button key="swap" variant="secondary" width="9.5rem" onClick={handleConnectToWalletClick}>
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
