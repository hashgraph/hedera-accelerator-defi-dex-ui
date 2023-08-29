import { Flex, Divider } from "@chakra-ui/react";
import { Color } from "../../../../shared/ui-kit/themes";
import { LockIcon } from "../../../../shared/ui-kit/components/Icons";
import { MetricLabel, Tooltip } from "../../../../shared/ui-kit";

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
  const { tokenSymbol, lockedGODToken, totalGODTokenBalance, availableGODTokenBalance } = props;
  const toolTipString = `Pending amount of ${tokenSymbol} token unlocks until
    the in-progress proposals are either complete or canceled`;
  return (
    <Flex height="96px" alignItems="center" justify="center" gap="40px">
      <MetricLabel
        isLoading={props.isLoading}
        label="TOTAL BALANCE"
        labelTextColor={Color.Neutral._700}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value={totalGODTokenBalance}
        valueStyle="p large semibold"
        valueTextColor={Color.Grey_Blue._800}
        valueUnitSymbol={tokenSymbol}
        valueUnitSymbolColor={Color.Grey_Blue._900}
        amount="$--.--"
        amountLabelColor={Color.Neutral._700}
      />
      <Divider orientation="vertical" />
      <MetricLabel
        label="LOCKED"
        isLoading={props.isLoading}
        labelTextColor={Color.Neutral._500}
        labelTextStyle="p xsmall medium"
        labelLeftIcon={<LockIcon />}
        labelOpacity="1.0"
        value={lockedGODToken}
        valueStyle="p medium medium"
        valueTextColor={Color.Grey_Blue._700}
        valueUnitSymbol={tokenSymbol}
        valueUnitSymbolColor={Color.Grey_Blue._700}
        amount="$--.--"
        amountLabelColor={Color.Neutral._500}
      />
      <MetricLabel
        label="AVAILABLE"
        isLoading={props.isLoading}
        labelTextColor={Color.Neutral._500}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value={availableGODTokenBalance}
        valueStyle="p medium medium"
        valueTextColor={Color.Grey_Blue._700}
        valueUnitSymbol={tokenSymbol}
        valueUnitSymbolColor={Color.Grey_Blue._700}
        amount="$--.--"
        amountLabelColor={Color.Neutral._500}
      />
      {!props.hidePendingStatus ? (
        <MetricLabel
          label="PENDING TO UNLOCK"
          isLoading={props.isLoading}
          labelTextColor={Color.Neutral._500}
          labelTextStyle="p xsmall medium"
          labelRightIcon={<Tooltip label={toolTipString} placement={"top"} fill={Color.Neutral._500} />}
          labelOpacity="1.0"
          value="200000.00"
          valueStyle="p large semibold"
          valueTextColor={Color.Grey_Blue._700}
          valueUnitSymbol={tokenSymbol}
          valueUnitSymbolColor={Color.Grey_Blue._700}
          amount="$--.--"
          amountLabelColor={Color.Neutral._500}
        />
      ) : null}
    </Flex>
  );
};
