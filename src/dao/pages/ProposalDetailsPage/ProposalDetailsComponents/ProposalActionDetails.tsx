import { Text, Flex } from "@chakra-ui/react";
import { Color, HashScanLink, HashscanData, HederaIcon, SendTokenIcon } from "@shared/ui-kit";
import { HBARTokenSymbol } from "@dex/services";
import { formatTokenAmountWithDecimal } from "@dex/utils";
import { ProposalEvent } from "@dao/hooks";
import { isFungible, isNFT } from "shared";

interface ProposalActionDetailsProps {
  amount: number;
  targetAccountId: string;
  tokenId: string;
  tokenSymbol: string;
  tokenDecimals: number;
  event: ProposalEvent;
  tokenType: string;
}

export function ProposalActionDetails(props: ProposalActionDetailsProps) {
  const { amount, targetAccountId, tokenId, tokenSymbol, event, tokenDecimals, tokenType } = props;

  return (
    <Flex direction="row" gap="16">
      <Flex direction="column" gap="2">
        <Text textStyle="p small medium">{event}</Text>
        <Flex direction="row" gap="1" alignItems="center">
          <HederaIcon />
          <SendTokenIcon boxSize={5} stroke={Color.Destructive._400} marginRight={1} marginLeft={2} />
          <Text textStyle="p medium regular" color={Color.Neutral._700}>
            {isFungible(tokenType) && `${formatTokenAmountWithDecimal(amount, tokenDecimals)} ${tokenSymbol}`}
            {isNFT(tokenType) && ` ${tokenSymbol} ${formatTokenAmountWithDecimal(amount, tokenDecimals)}`}
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
