import { Text as ChakraText, Flex, Skeleton } from "@chakra-ui/react";
import { Color } from "../../themes";
import { ReactElement, isValidElement } from "react";
import { isNotNil } from "ramda";
import { Text } from "../Text";

interface MetricLabelProps {
  label: string;
  value: string | number | ReactElement;
  isLoading?: boolean;
  labelLeftIcon?: ReactElement;
  labelRightIcon?: ReactElement;
  labelTextColor?: string;
  labelTextStyle?: string;
  labelOpacity?: string;
  valueTextColor?: string;
  valueStyle?: string;
  valueUnitSymbol?: string | ReactElement;
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
    labelTextStyle = "p small medium",
    valueStyle = "p small regular",
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
        <ChakraText textStyle={labelTextStyle} color={labelTextColor} opacity={labelOpacity}>
          {label}
        </ChakraText>
        {labelRightIcon}
      </Flex>
      <Skeleton speed={0.4} fadeDuration={0} isLoaded={!isLoading}>
        <Flex flexDirection="column" align="flex-start" gap="0px">
          <Flex direction="row" gap="3px" alignItems="center">
            <ChakraText textStyle={valueStyle} color={valueTextColor}>
              {isValidElement(value) ? value : String(value)}
            </ChakraText>
            {isValidElement(valueUnitSymbol) ? (
              valueUnitSymbol
            ) : isNotNil(valueUnitSymbol) ? (
              <Text.P_Medium_Medium color={valueUnitSymbolColor}>{valueUnitSymbol}</Text.P_Medium_Medium>
            ) : null}
          </Flex>
          {amount ? <Text.P_Small_Medium color={amountLabelColor}>{amount}</Text.P_Small_Medium> : null}
        </Flex>
      </Skeleton>
    </Flex>
  );
};
