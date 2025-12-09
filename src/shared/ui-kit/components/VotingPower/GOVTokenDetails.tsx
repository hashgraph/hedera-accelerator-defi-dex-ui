import { Divider, Flex, useBreakpointValue } from "@chakra-ui/react";
import { LockIcon, MetricLabel, Tooltip, useTheme } from "@shared/ui-kit";

interface GOVTokenDetailsProps {
  tokenSymbol: string;
  lockedGODToken: string;
  lockedGODTokenValue?: string;
  totalGODTokenBalance: string;
  totalGODTokenBalanceValue?: string;
  availableGODTokenBalance: string;
  availableGODTokenBalanceValue?: string;
  isLoading?: boolean;
  hidePendingStatus?: boolean;
}

export const GOVTokenDetails = (props: GOVTokenDetailsProps) => {
  const theme = useTheme();
  const { tokenSymbol, lockedGODToken, totalGODTokenBalance, availableGODTokenBalance } = props;
  const toolTipString = `Pending amount of ${tokenSymbol} token unlocks until
    the in-progress proposals are either complete or canceled`;

  const gap = useBreakpointValue({ base: "1rem", md: "1.5rem", lg: "2.5rem" });
  const showDivider = useBreakpointValue({ base: false, lg: true });

  return (
    <Flex
      height={{ base: "auto", lg: "6rem" }}
      alignItems="center"
      justify="center"
      gap={gap}
      flexWrap="wrap"
      py={{ base: 2, lg: 0 }}
    >
      <MetricLabel
        isLoading={props.isLoading}
        label="TOTAL BALANCE"
        labelTextColor={theme.textMuted}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value={totalGODTokenBalance}
        valueStyle="p large semibold"
        valueTextColor={theme.text}
        valueUnitSymbol={tokenSymbol}
        valueUnitSymbolColor={theme.text}
        amount="$--.--"
        amountLabelColor={theme.textMuted}
      />
      {showDivider && <Divider orientation="vertical" borderColor={theme.border} />}
      <MetricLabel
        label="LOCKED"
        isLoading={props.isLoading}
        labelTextColor={theme.textMuted}
        labelTextStyle="p xsmall medium"
        labelLeftIcon={<LockIcon />}
        labelOpacity="1.0"
        value={lockedGODToken}
        valueStyle="p medium medium"
        valueTextColor={theme.text}
        valueUnitSymbol={tokenSymbol}
        valueUnitSymbolColor={theme.text}
        amount="$--.--"
        amountLabelColor={theme.textMuted}
      />
      <MetricLabel
        label="AVAILABLE"
        isLoading={props.isLoading}
        labelTextColor={theme.textMuted}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value={availableGODTokenBalance}
        valueStyle="p medium medium"
        valueTextColor={theme.text}
        valueUnitSymbol={tokenSymbol}
        valueUnitSymbolColor={theme.text}
        amount="$--.--"
        amountLabelColor={theme.textMuted}
      />
      {!props.hidePendingStatus ? (
        <MetricLabel
          label="PENDING TO UNLOCK"
          isLoading={props.isLoading}
          labelTextColor={theme.textMuted}
          labelTextStyle="p xsmall medium"
          labelRightIcon={<Tooltip label={toolTipString} placement={"top"} fill={theme.textMuted} />}
          labelOpacity="1.0"
          value="200000.00"
          valueStyle="p large semibold"
          valueTextColor={theme.text}
          valueUnitSymbol={tokenSymbol}
          valueUnitSymbolColor={theme.text}
          amount="$--.--"
          amountLabelColor={theme.textMuted}
        />
      ) : null}
    </Flex>
  );
};
