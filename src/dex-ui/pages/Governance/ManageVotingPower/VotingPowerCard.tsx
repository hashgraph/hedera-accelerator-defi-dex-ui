import { HStack } from "@chakra-ui/react";
import { Color } from "../../../../dex-ui-components/themes";
import { LockIcon } from "../../../../dex-ui-components/base/Icons";
import { Divider } from "@material-ui/core";
import { MetricLabel, Tooltip } from "../../../../dex-ui-components";

interface VotingPowerCardProps {
  balance: number | undefined;
  isLoading?: boolean;
  hidePendingStatus?: boolean;
}

export const VotingPowerCard = (props: VotingPowerCardProps) => {
  const toolTipString = `Pending amount of token unlocks until
    the in-progress proposals are either complete or canceled`;
  return (
    <HStack height="96px" alignItems="center" justify="center" gap="40px">
      <MetricLabel
        label="TOTAL BALANCE"
        labelTextColor={Color.Neutral._700}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value={`${props.balance}`}
        valueStyle="p large semibold"
        valueTextColor={Color.Grey_Blue._800}
        valueUnitSymbol="GOV"
        valueUnitSymbolColor={Color.Grey_Blue._900}
        amount="$153.12"
        amountLabelColor={Color.Neutral._700}
      />
      <Divider orientation="vertical" />
      <MetricLabel
        label="LOCKED"
        labelTextColor={Color.Neutral._500}
        labelTextStyle="p xsmall medium"
        labelLeftIcon={<LockIcon />}
        labelOpacity="1.0"
        value="200000.00"
        valueStyle="p medium medium"
        valueTextColor={Color.Grey_Blue._700}
        valueUnitSymbol="GOV"
        valueUnitSymbolColor={Color.Grey_Blue._700}
        amount="$400.00"
        amountLabelColor={Color.Neutral._500}
      />
      <MetricLabel
        label="AVAILABLE"
        labelTextColor={Color.Neutral._500}
        labelTextStyle="p xsmall medium"
        labelOpacity="1.0"
        value="200000.00"
        valueStyle="p medium medium"
        valueTextColor={Color.Grey_Blue._700}
        valueUnitSymbol="GOV"
        valueUnitSymbolColor={Color.Grey_Blue._700}
        amount="$410.00"
        amountLabelColor={Color.Neutral._500}
      />
      {!props.hidePendingStatus ? (
        <MetricLabel
          label="PENDING TO UNLOCK"
          labelTextColor={Color.Neutral._500}
          labelTextStyle="p xsmall medium"
          labelRightIcon={<Tooltip label={toolTipString} placement={"top"} fill={Color.Neutral._500} />}
          labelOpacity="1.0"
          value="200000.00"
          valueStyle="p large semibold"
          valueTextColor={Color.Grey_Blue._700}
          valueUnitSymbol="GOV"
          valueUnitSymbolColor={Color.Grey_Blue._700}
          amount="$400.00"
          amountLabelColor={Color.Neutral._500}
        />
      ) : null}
    </HStack>
  );
};
