import { Flex, Text, Skeleton } from "@chakra-ui/react";
import { Color } from "../../themes";

interface MetricLabelProps {
  label: string;
  value: string;
  isLoading?: boolean;
  labelLeftIcon?: React.ReactElement;
  labelRightIcon?: React.ReactElement;
  labelTextColor?: string;
  labelTextStyle?: string;
  labelOpacity?: string;
  valueTextColor?: string;
  valueStyle?: string;
  valueUnitSymbol?: string;
  valueUnitSymbolColor?: string;
  amount?: string;
  amountLabelColor?: string;
}

export const MetricLabel = (props: MetricLabelProps) => {
  const {
    label,
    value,
    valueUnitSymbol,
    labelLeftIcon,
    labelRightIcon,
    amount,
    isLoading = false,
    labelTextStyle = "h4",
    valueStyle = "b1",
    labelTextColor = Color.Neutral._900,
    valueTextColor = Color.Text_Primary,
    valueUnitSymbolColor = Color.Primary._600,
    amountLabelColor = Color.Primary._500,
    labelOpacity = 0.8,
  } = props;

  return (
    <Flex flexDirection="column" gap="1">
      <Flex flexDirection="row" alignItems="center" gap="1" height="1.2rem">
        {labelLeftIcon}
        <Text textStyle={labelTextStyle} color={labelTextColor} opacity={labelOpacity}>
          {label}
        </Text>
        {labelRightIcon}
      </Flex>
      <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
        <Flex flexDirection="column" align="flex-start" gap="0px">
          <Flex direction="row" gap="3px" alignItems="center">
            <Text textStyle={valueStyle} color={valueTextColor}>
              {value}
            </Text>
            {valueUnitSymbol ? (
              <Text textStyle="p medium medium" color={valueUnitSymbolColor}>
                {valueUnitSymbol}
              </Text>
            ) : null}
          </Flex>
          {amount ? (
            <Text textStyle="p small medium" color={amountLabelColor}>
              {amount}
            </Text>
          ) : null}
        </Flex>
      </Skeleton>
    </Flex>
  );
};
