import { Text, Flex } from "@chakra-ui/react";
import { Color, HashScanLink, HashscanData, HederaIcon, SendTokenIcon } from "@dex-ui-components";
import { HBARTokenSymbol } from "@services";
import { formatTokenAmountWithDecimal } from "@utils";
import { ProposalEvent } from "@hooks";

interface ProposalActionDetailsProps {
  amount: number;
  targetAccountId: string;
  tokenId: string;
  tokenSymbol: string;
  tokenDecimals: number;
  event: ProposalEvent;
}

export function ProposalActionDetails(props: ProposalActionDetailsProps) {
  const { amount, targetAccountId, tokenId, tokenSymbol, event, tokenDecimals } = props;

  return (
    <Flex direction="row" gap="16">
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">{event}</Text>
        <Flex direction="row" gap="1" alignItems="center">
          <HederaIcon />
          <SendTokenIcon boxSize={5} stroke={Color.Destructive._400} marginRight={1} marginLeft={2} />
          <Text textStyle="p medium regular" color={Color.Neutral._700}>
            {formatTokenAmountWithDecimal(amount, tokenDecimals)} {tokenSymbol}
          </Text>
          {tokenSymbol !== HBARTokenSymbol ? (
            <HashScanLink id={tokenId} type={HashscanData.Token} withParentheses />
          ) : null}
        </Flex>
      </Flex>
      <Flex direction="column" gap="4">
        <Text textStyle="p small medium">To</Text>
        <HashScanLink id={targetAccountId} type={HashscanData.Account} />
      </Flex>
    </Flex>
  );
}
