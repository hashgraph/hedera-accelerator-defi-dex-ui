import { Text, Flex } from "@chakra-ui/react";
import { Color } from "@dex-ui-components";

interface ProposalTransactionDetailsProps {
  transactionHash: string;
  created: string;
}

export function ProposalTransactionDetails(props: ProposalTransactionDetailsProps) {
  const { transactionHash, created } = props;
  return (
    <Flex direction="row" gap="12">
      <Flex flexDirection="column" alignItems="start" gap="2">
        <Text textStyle="p small medium">Transaction hash</Text>
        <Text textStyle="p small medium">Created</Text>
      </Flex>
      <Flex flexDirection="column" alignItems="start" gap="2">
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {transactionHash}
        </Text>
        <Text textStyle="p small regular" color={Color.Neutral._700}>
          {created}
        </Text>
      </Flex>
    </Flex>
  );
}
