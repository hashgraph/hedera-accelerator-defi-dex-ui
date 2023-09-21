import { Flex } from "@chakra-ui/react";
import { Color } from "../../themes";
import { useFormTokenInputContext } from "./FormTokenInputContext";
import { Text } from "../Text";

export function FormTokenInputLabel() {
  const {
    token: { balanceDisplay, tokenSymbolDisplay },
  } = useFormTokenInputContext();

  return (
    <Flex alignItems="center" justifyContent="space-between" flex="1">
      <Text.P_Small_Medium>Amount</Text.P_Small_Medium>
      <Flex alignItems="center" gap="3px">
        <Text.P_XSmall_Regular color={Color.Neutral._400}>Available:&nbsp;</Text.P_XSmall_Regular>
        <Text.P_XSmall_Semibold color={Color.Neutral._900}>{balanceDisplay}</Text.P_XSmall_Semibold>
        <Text.P_XSmall_Medium color={Color.Neutral._400}>{tokenSymbolDisplay}</Text.P_XSmall_Medium>
      </Flex>
    </Flex>
  );
}
