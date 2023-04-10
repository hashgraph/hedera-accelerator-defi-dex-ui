import { Flex, Text, Skeleton } from "@chakra-ui/react";
import { Color } from "../../themes";

interface MetricLabelProps {
  label: string;
  labelLeftIcon?: React.ReactElement;
  labelRightIcon?: React.ReactElement;
  labelTextColor?: string;
  labelTextStyle?: string;
  labelOpacity?: string;
  value?: string;
  valueTextColor?: string;
  valueStyle?: string;
  valueUnitSymbol?: string;
  valueUnitSymbolColor?: string;
  amount?: string;
  amountLabelColor?: string;
  isLoading?: boolean;
}

export const MetricLabel = (props: MetricLabelProps) => {
  const { label, value, isLoading = false } = props;
  return (
    <Flex flexDirection="column" gap="1">
      <Flex flexDirection="row" alignItems="center" gap="1">
        {props.labelLeftIcon ? props.labelLeftIcon : null}
        <Text
          textStyle={props.labelTextStyle ? props.labelTextStyle : "h4"}
          color={props.labelTextColor ? props.labelTextColor : Color.Neutral._900}
          opacity={props.labelOpacity ? props.labelOpacity : 0.8}
        >
          {label}
        </Text>
      </Flex>
      {props.labelRightIcon ? props.labelRightIcon : null}
      <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
        <Flex flexDirection="column" align="flex-start" gap="0px">
          <Flex direction="row" gap="3px" alignItems="center">
            <Text
              textStyle={props.valueStyle ? props.valueStyle : "b1"}
              color={props.valueTextColor ? props.valueTextColor : Color.Black}
            >
              {value}
            </Text>
            {props.valueUnitSymbol ? (
              <Text
                textStyle="p medium medium"
                color={props.valueUnitSymbolColor ? props.valueUnitSymbolColor : Color.Primary._600}
              >
                {props.valueUnitSymbol}
              </Text>
            ) : null}
          </Flex>
          {props.amount ? (
            <Text
              textStyle="p small medium"
              color={props.amountLabelColor ? props.amountLabelColor : Color.Neutral._500}
            >
              {props.amount}
            </Text>
          ) : null}
        </Flex>
      </Skeleton>
    </Flex>
  );
};
