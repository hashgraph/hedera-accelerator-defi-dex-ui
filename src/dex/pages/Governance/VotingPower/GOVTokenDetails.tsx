import { Flex, Divider } from "@chakra-ui/react";
import { LockIcon } from "../../../../shared/ui-kit/components/Icons";
import { MetricLabel, Tooltip, useTheme } from "../../../../shared/ui-kit";

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
  return (
    <Flex height="96px" alignItems="center" justify="center" gap="40px">
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
      <Divider orientation="vertical" borderColor={theme.border} />
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
