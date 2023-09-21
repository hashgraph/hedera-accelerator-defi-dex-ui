import { Flex } from "@chakra-ui/react";
import { Text, Color } from "@shared/ui-kit";

interface ProposalTransactionDetailsProps {
  transactionHash: string;
}

export function ProposalTransactionDetails(props: ProposalTransactionDetailsProps) {
  const { transactionHash } = props;
  return (
    <Flex direction="row" gap="12">
      <Flex flexDirection="column" alignItems="start" gap="2">
        <Text.P_Small_Medium>Transaction hash</Text.P_Small_Medium>
      </Flex>
      <Flex flexDirection="column" alignItems="start" gap="2">
        <Text.P_Small_Regular color={Color.Neutral._700}>{transactionHash}</Text.P_Small_Regular>
      </Flex>
    </Flex>
  );
}
