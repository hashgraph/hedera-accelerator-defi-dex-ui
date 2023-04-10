import { Text, HStack, Button, Spacer, Flex } from "@chakra-ui/react";
import { Color } from "../../../../dex-ui-components/themes";
import { LightningBoltIcon, SwapIcon } from "../../../../dex-ui-components/base/Icons";
import { VotingPowerCard } from "./VotingPowerCard";
import { ManageGovToken } from "./ManageGovToken";
import { useNavigate } from "react-router-dom";
import { useManageVotingPower } from "./useManageVotingPower";
import { MetricLabel } from "../../../../dex-ui-components";

export const ManageVotingPower = () => {
  const { userGOVTokenWalletBalance, isLoading, doesUserHaveGOVTokensToLock } = useManageVotingPower();

  const navigate = useNavigate();

  function handleClickSwapButton() {
    navigate("/swap");
  }

  return (
    <Flex direction="row" alignItems="center" padding="24px 80px 16px" height="88px" maxWidth="1440px">
      <MetricLabel
        label="VOTING POWER"
        labelLeftIcon={<LightningBoltIcon />}
        labelTextColor={Color.Neutral._500}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value="200000.00"
        valueTextColor={Color.Primary._600}
        valueStyle="h3 medium"
        valueUnitSymbol="GOV"
        amount="$153.12"
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
        <VotingPowerCard balance={userGOVTokenWalletBalance} isLoading={isLoading} hidePendingStatus />
        {doesUserHaveGOVTokensToLock ? (
          <ManageGovToken />
        ) : (
          <Button key="swap" variant="secondary" width="105px" leftIcon={<SwapIcon />} onClick={handleClickSwapButton}>
            <Text textStyle="p small semibold">Swap</Text>
          </Button>
        )}
      </HStack>
    </Flex>
  );
};
