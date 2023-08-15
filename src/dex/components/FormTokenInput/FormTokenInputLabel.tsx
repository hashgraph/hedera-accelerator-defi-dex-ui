import { Text, Flex } from "@chakra-ui/react";
import { Color } from "@shared/ui-kit";
import { useFormTokenInputContext } from "./FormTokenInputContext";

export function FormTokenInputLabel() {
  const {
    token: { balanceDisplay, tokenSymbolDisplay },
  } = useFormTokenInputContext();

  return (
    <Flex alignItems="center" justifyContent="space-between" flex="1">
      <Text textStyle="p small medium">Amount</Text>
      <Flex alignItems="center" gap="3px">
        <Text textStyle="p xsmall regular" color={Color.Neutral._400}>
          Available:&nbsp;
        </Text>
        <Text textStyle="p xsmall semibold" color={Color.Neutral._900}>
          {balanceDisplay}
        </Text>
        <Text textStyle="p xsmall medium" color={Color.Neutral._400}>
          {tokenSymbolDisplay}
        </Text>
      </Flex>
    </Flex>
  );
}
